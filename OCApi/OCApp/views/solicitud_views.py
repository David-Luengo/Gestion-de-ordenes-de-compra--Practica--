from ..models import Ceco, FechaEstado, Usuario, Solicitud, Cotizacion,CuentaContable
from rest_framework import viewsets, permissions, status
from ..serializers import FechaEstadoSerializer, SolicitudSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from datetime import datetime
import os
import zipfile
from io import BytesIO
import requests
from django.utils import timezone
from django.core.paginator import Paginator, EmptyPage
from django.shortcuts import get_object_or_404

from django.core.mail import send_mail
from django.template.loader import render_to_string

from django.db.models import Q, F

# for env variables
from dotenv import load_dotenv

load_dotenv()

class SolicitudViewSet(viewsets.ModelViewSet):
    queryset = Solicitud.objects.all()
    serializer_class = SolicitudSerializer
    permission_classes = [permissions.IsAuthenticated]
 
    @action(detail=False, methods=['GET'])
    def solicitudes_por_operador(self, request):
        """
        Retrieves a list of solicitudes (requests) for a specific operador (operator) based on the provided parameters.

        Parameters:
        - id: The ID of the operador.
        - page: The page number of the solicitudes to retrieve.
        - pageSize: The number of solicitudes to retrieve per page.
        - proveedorRut: The rut (identifier) of the proveedor.
        - startDate: The start date for filtering solicitudes.
        - endDate: The end date for filtering solicitudes.

        Returns:
        - A Response object containing the list of solicitudes data and the total number of pages.
        """
        id = request.query_params.get('id')
        page_number = request.GET.get('page', 1)
        page_size = request.GET.get('pageSize', 1000000)
        
        proveedor_rut = request.GET.get('proveedorRut')
        start_date = request.GET.get('startDate')
        end_date = request.GET.get('endDate')
        
        if not id:
            return Response({'error': 'Debes proporcionar un id en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)
        if not page_number:
            return Response({'error': 'Debes proporcionar un page en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)
        if not page_size:
            return Response({'error': 'Debes proporcionar un pageSize en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if proveedor_rut and proveedor_rut.lower() != 'null':
                cotizaciones = Cotizacion.objects.filter(rut_proveedor__rut_proveedor=proveedor_rut)
                solicitudes_asignadas = Solicitud.objects.filter(
                    Q(id_solicitud__in=cotizaciones.values('id_solicitud')) &
                    Q(asignado_operador=F('asignado_operador'))
                )
            else:
                solicitudes_asignadas = Solicitud.objects.filter(asignado_operador=id)
                
            # Filtra las solicitudes por el ID de asignado_operador especificado
            # solicitudes_asignadas = Solicitud.objects.filter(asignado_operador=id)
            
            if start_date and end_date and start_date.lower() != 'null' and end_date.lower() != 'null':
                start_date = datetime.strptime(start_date, "%Y-%m-%d")
                end_date = datetime.strptime(end_date, "%Y-%m-%d")
                solicitudes_asignadas = solicitudes_asignadas.filter(fechaestado__fecha_recibida__range=(start_date, end_date))
                
                if not solicitudes_asignadas.exists():
                    return Response({'data': [], 'total_pages': 0}, status=status.HTTP_200_OK)
            
            paginator = Paginator(solicitudes_asignadas, per_page=page_size)

            try:
                page_obj = paginator.page(page_number)
            except EmptyPage:
                page_obj = paginator.page(1)
            
            solicitudes_data = []
            for solicitud in page_obj:
                # print("rut_usuario:", solicitud.rut_usuario.rut_usuario)
                
                # Fetch the Usuario object based on rut_usuario
                # Problema con el backend, se debe mencionar 2 veces el rut de usuario en 
                # la consulta por alguna razón que no puedo ver.
                usuario = get_object_or_404(Usuario, rut_usuario=solicitud.rut_usuario.rut_usuario)
                
                # Retrieve the nombre attribute from the Usuario object
                nombre_usuario = usuario.nombre
                
                solicitud_data = SolicitudSerializer(solicitud).data
                
                fecha_estado_data = {
                    'fecha_recibida': solicitud.fechaestado.fecha_recibida if solicitud.fechaestado else None,
                    'fecha_asignada': solicitud.fechaestado.fecha_asignada if solicitud.fechaestado else None,
                    'fecha_en_progreso': solicitud.fechaestado.fecha_en_progreso if solicitud.fechaestado else None,
                    'fecha_finalizada': solicitud.fechaestado.fecha_finalizada if solicitud.fechaestado else None,
                    'nombre_usuario': nombre_usuario,
                }
                
                solicitud_data.update(fecha_estado_data)
                solicitudes_data.append(solicitud_data)

            return Response({'data': solicitudes_data, 'total_pages': paginator.num_pages}, status=status.HTTP_200_OK)

        except Solicitud.DoesNotExist:
            return Response({'error': 'No se encontraron solicitudes para este asignado_operador.'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['GET'])
    def solicitudes_por_usuario(self, request):
        """
        Retrieves a list of solicitudes for a given user, with pagination.

        Parameters:
            request (Request): The HTTP request object, user_id, page, and pageSize.

        Returns:
            Response: The HTTP response object containing a list of solicitudes with corresponding dates and the total number of pages.
        """
        user_id = request.query_params.get('user_id')
        page_number = request.GET.get('page', 1)
        page_size = request.GET.get('pageSize', 100000)
        
        proveedor_rut = request.GET.get('proveedorRut')
        start_date = request.GET.get('startDate')
        end_date = request.GET.get('endDate')

        if not user_id:
            return Response({'error': 'Debes proporcionar un user_id en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)
        if not page_number:
            return Response({'error': 'Debes proporcionar un page en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)
        if not page_size:
            return Response({'error': 'Debes proporcionar un pageSize en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if proveedor_rut and proveedor_rut.lower() != 'null':
                cotizaciones = Cotizacion.objects.filter(rut_proveedor__rut_proveedor=proveedor_rut)
                solicitudes = Solicitud.objects.filter(id_solicitud__in=cotizaciones.values('id_solicitud'))
            else:
                solicitudes = Solicitud.objects.filter(rut_usuario=user_id)
                
            if start_date and end_date and start_date.lower() != 'null' and end_date.lower() != 'null':
                start_date = datetime.strptime(start_date, "%Y-%m-%d")
                end_date = datetime.strptime(end_date, "%Y-%m-%d")
                solicitudes = solicitudes.filter(fechaestado__fecha_recibida__range=(start_date, end_date))
                
                if not solicitudes.exists():
                    return Response({'data': [], 'total_pages': 0}, status=status.HTTP_200_OK)
            
            paginator = Paginator(solicitudes, per_page=page_size)

            try:
                page_obj = paginator.page(page_number)
            except EmptyPage:
                page_obj = paginator.page(1)

            solicitudes_data = []
            for solicitud in page_obj:
                
                solicitud_data = SolicitudSerializer(solicitud).data
                
                fecha_estado_data = {
                    'fecha_recibida': solicitud.fechaestado.fecha_recibida if solicitud.fechaestado else None,
                    'fecha_asignada': solicitud.fechaestado.fecha_asignada if solicitud.fechaestado else None,
                    'fecha_en_progreso': solicitud.fechaestado.fecha_en_progreso if solicitud.fechaestado else None,
                    'fecha_finalizada': solicitud.fechaestado.fecha_finalizada if solicitud.fechaestado else None,
                }
                
                solicitud_data.update(fecha_estado_data)
                solicitudes_data.append(solicitud_data)

            return Response({'data': solicitudes_data, 'total_pages': paginator.num_pages}, status=status.HTTP_200_OK)

        except Solicitud.DoesNotExist:
            return Response({'error': 'No se encontraron solicitudes para este usuario.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=False, methods=['GET'])
    def todas_las_solicitudes(self, request):
        """
        A view to retrieve all requests with a specific date range and pagination.
        
        Parameters:
        - request: The request object containing query parameters for pagination and filtering.
        
        Returns:
        - Response: A JSON response containing the requested data and pagination information.
        """
        page_number = request.GET.get('page', 1)
        page_size = request.GET.get('pageSize', 1000000000000)
        
        proveedor_rut = request.GET.get('proveedorRut')
        start_date = request.GET.get('startDate')
        end_date = request.GET.get('endDate')
        
        if not page_number:
            return Response({'error': 'Debes proporcionar un page en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)
        if not page_size:
            return Response({'error': 'Debes proporcionar un pageSize en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if proveedor_rut and proveedor_rut.lower() != 'null':
                cotizaciones = Cotizacion.objects.filter(rut_proveedor__rut_proveedor=proveedor_rut)
                solicitudes = Solicitud.objects.filter(id_solicitud__in=cotizaciones.values('id_solicitud'))
            else:
                solicitudes = Solicitud.objects.all()
                
            if start_date and end_date and start_date.lower() != 'null' and end_date.lower() != 'null':
                start_date = datetime.strptime(start_date, "%Y-%m-%d")
                end_date = datetime.strptime(end_date, "%Y-%m-%d")
                solicitudes = solicitudes.filter(fechaestado__fecha_recibida__range=(start_date, end_date))
                
                if not solicitudes.exists():
                    return Response({'data': [], 'total_pages': 0}, status=status.HTTP_200_OK)
                
            paginator = Paginator(solicitudes, per_page=page_size)

            try:
                page_obj = paginator.page(page_number)
            except EmptyPage:
                page_obj = paginator.page(1)

            solicitudes_data = []
            for solicitud in page_obj:
                
                usuario = get_object_or_404(Usuario, rut_usuario=solicitud.rut_usuario.rut_usuario)
                
                # Retrieve the nombre attribute from the Usuario object
                nombre_usuario = usuario.nombre
                
                solicitud_data = SolicitudSerializer(solicitud).data
                
                
                fecha_estado_data = {
                    'fecha_recibida': solicitud.fechaestado.fecha_recibida if solicitud.fechaestado else None,
                    'fecha_asignada': solicitud.fechaestado.fecha_asignada if solicitud.fechaestado else None,
                    'fecha_en_progreso': solicitud.fechaestado.fecha_en_progreso if solicitud.fechaestado else None,
                    'fecha_finalizada': solicitud.fechaestado.fecha_finalizada if solicitud.fechaestado else None,
                    'nombre_usuario': nombre_usuario,
                }
                
                solicitud_data.update(fecha_estado_data)
                solicitudes_data.append(solicitud_data)

            return Response({'data': solicitudes_data, 'total_pages': paginator.num_pages}, status=status.HTTP_200_OK)
        
        except Solicitud.DoesNotExist:
            return Response({'error': 'Error al obtener las solicitudes con fecha'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=False, methods=['GET'])
    def solicitud(self, request):
        """
        A view to retrieve a specific solicitud and its associated fechas by ID.
        
        Parameters:
            request: the request object
            
        Returns:
            Response: a response containing the combined data of the solicitud and fechas, or an error message
        """
        id_solicitud = request.query_params.get('id_solicitud')
        if not id_solicitud:
            return Response({'error': 'Debes proporcionar un id_solicitud en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # Filtra las solicitudes por el ID de solicitud especificado
            solicitud = Solicitud.objects.get(id_solicitud=id_solicitud)
            # Obtén las fechas de la solicitud
            fechas = FechaEstado.objects.get(id_solicitud=solicitud)
            # Serializa tanto la solicitud como las fechas
            solicitud_serializer = SolicitudSerializer(solicitud)
            fechas_serializer = FechaEstadoSerializer(fechas)
            
            # Combina la solicitud y las fechas en un solo diccionario
            combined_data = {**solicitud_serializer.data, **fechas_serializer.data}

            return Response(combined_data, status=status.HTTP_200_OK)
        except Solicitud.DoesNotExist:
            return Response({'error': 'No se encontró la solicitud con el ID especificado.'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=['POST'])
    def download_documents_as_zip(self, request):
        """
        A method to download documents as a zip file and return the zip file as an HTTP response.
        
        Parameters:
            request (Request): The request object containing data with file URLs.
            
        Returns:
            HttpResponse: HTTP response with a zip file containing the downloaded documents.
        """
        data = request.data
        zip_buffer = BytesIO()

        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for file_url in data.get('cotizacionesUrls', []):
                # Descargar el archivo desde la URL
                response = requests.get(file_url)

                if response.status_code == 200:
                    # Obtener el nombre del archivo del URL
                    file_name = os.path.basename(file_url)

                    # Agregar el archivo descargado al ZIP
                    zip_file.writestr(file_name, response.content)

        zip_buffer.seek(0)
        response = HttpResponse(zip_buffer, content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="Cotizaciones.zip"'
        return response
    
    def create(self, request):
        """
        A method to create a new solicitud.
        
        params:
            request: the form data
            
        """
        # Establecer el estado como "Recibida" al crear una solicitud
        request.data['estado'] = 'Recibida'
        solicitud_serializer = SolicitudSerializer(data=request.data)
        if solicitud_serializer.is_valid():
            solicitud = solicitud_serializer.save()

            # Crear el registro de FechaEstado con id_solicitud establecido
            fecha_estado = FechaEstado(id_solicitud=solicitud,fecha_recibida=timezone.now())
            fecha_estado.save()

            headers = self.get_success_headers(solicitud_serializer.data)
            return Response(solicitud_serializer.data, status=201, headers=headers)

        return Response(solicitud_serializer.errors, status=400)

    @action(detail=False, methods=['PATCH'])
    def procesar_solicitud(self, request):
        """
        Process a solicitud by updating its fields and related entities. Handles different states of the solicitud, updates budgets if necessary, and saves the changes. Returns the serialized data of the updated solicitud.
        """
        solicitud_id = request.data.get('solicitud_id')
        estado = request.data.get('estado')
        descripcion_operador = request.data.get('descripcion_operador')
        dinero_solicitud = request.data.get('dinero_solicitud')

        try:
            solicitud = Solicitud.objects.get(id_solicitud=solicitud_id)
            id_cuentacontable = solicitud.id_cuentacontable.id_cuentacontable
            
            try:
                # Intenta obtener la instancia de CuentaContable asociada a la solicitud
                cuentacontable = CuentaContable.objects.get(id_cuentacontable=id_cuentacontable)
                id_ceco = cuentacontable.id_ceco.id_ceco
                
                try:
                    # Intenta obtener la instancia de Ceco asociada a la instancia de CuentaContable
                    ceco = Ceco.objects.get(id_ceco=id_ceco)
                except Ceco.DoesNotExist:
                    return Response({"error": "El ceco no existe"}, status=status.HTTP_404_NOT_FOUND)
            except CuentaContable.DoesNotExist:
                return Response({"error": "La cuenta contable no existe"}, status=status.HTTP_404_NOT_FOUND)
        except Solicitud.DoesNotExist:
            return Response({"error": "La solicitud no existe"}, status=status.HTTP_404_NOT_FOUND)

        # Intenta obtener la instancia de FechaEstado asociada a la solicitud
        try:
            fecha_estado = FechaEstado.objects.get(id_solicitud=solicitud)
        except FechaEstado.DoesNotExist:
            fecha_estado = None

        # Actualiza los campos específicos de la solicitud
        solicitud.estado = estado
        solicitud.descripcion_operador = descripcion_operador
        
        if estado == 'Aprobada':
            ceco.presupuesto_disponible = ceco.presupuesto_disponible - dinero_solicitud
            ceco.save()

        # Si el estado es 'Aprobada' o 'Rechazada' y la instancia de FechaEstado existe, actualiza la fecha_finalizada
        if (estado == 'Aprobada' or estado == 'Rechazada') and fecha_estado:
            fecha_estado.fecha_finalizada = timezone.now()
            fecha_estado.save()

        solicitud.save()

        serializer = self.get_serializer(solicitud)
        return Response(serializer.data, status=status.HTTP_200_OK) 
    
    @action(detail=False, methods=['PATCH'])
    def asignar_solicitud(self, request):
        """
        Assign a solicitud to an operator.
        
        params:
            request: the form data with asignado_operador and id_solicitud
            
        """
        id_solicitud = request.data.get('id_solicitud')
        asignado_operador = request.data.get('asignado_operador')
        try:
            solicitud = Solicitud.objects.get(id_solicitud=id_solicitud)
        except Solicitud.DoesNotExist:
            return Response({"error": "La solicitud no existe"}, status=status.HTTP_404_NOT_FOUND)

        # Intenta obtener la instancia de FechaEstado asociada a la solicitud
        try:
            fecha_estado = FechaEstado.objects.get(id_solicitud=solicitud)
        except FechaEstado.DoesNotExist:
            fecha_estado = None
        
        try:
            instancia_operador = Usuario.objects.get(rut_usuario=asignado_operador)
        except Usuario.DoesNotExist:
            return Response({"error": "El operador no existe "}, status=status.HTTP_404_NOT_FOUND)


        # Actualiza el estado y el operador asignado de la solicitud
        solicitud.estado = 'Asignada'
        solicitud.asignado_operador = instancia_operador
        solicitud.save()

        # Verifica si existe fecha_estado antes de intentar actualizar la fecha asignada
        if fecha_estado:
            fecha_estado.fecha_asignada = timezone.now()
            fecha_estado.save()

        serializer = self.get_serializer(solicitud)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['PATCH'])
    def en_progreso_solicitud(self, request):
        """
        Updates the state of a solicitud to 'En progreso'.
        
        params:
            request: the form data with id_solicitud
        """
        id_solicitud = request.data.get('id_solicitud')
        try:
            solicitud = Solicitud.objects.get(id_solicitud=id_solicitud)
        except Solicitud.DoesNotExist:
            return Response({"error": "La solicitud no existe"}, status=status.HTTP_404_NOT_FOUND)

        # Intenta obtener la instancia de FechaEstado asociada a la solicitud
        try:
            fecha_estado = FechaEstado.objects.get(id_solicitud=solicitud)
        except FechaEstado.DoesNotExist:
            fecha_estado = None

        # Actualiza el estado de la solicitud
        solicitud.estado = 'En progreso'
        solicitud.save()

        # Verifica si existe fecha_estado antes de intentar actualizar la fecha asignada
        if fecha_estado:
            fecha_estado.fecha_en_progreso = timezone.now()
            fecha_estado.save()

        serializer = self.get_serializer(solicitud)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['POST'])    
    def correo_solicitud(self, request):
        """
        A function to send a confirmation email with order details to a user and an administrator.
        """
        
        # Se guardan datos del request en variables
        userid = request.GET.get('userid')
        solicitud_id = request.GET.get('solicitud_id')
        
        # Validación de datos
        if not all([userid, solicitud_id]):
            return Response({'error': 'Todos los campos son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch user details including email
        try:
            user = Usuario.objects.get(id=userid)
            email = user.email
            nombre = user.nombre
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        variables = {
            'empresa': 'DUOC UC - Gestión ordenes de compra',
            'solicitud_id': solicitud_id,
            'email': email,
            'nombre': nombre,
        }
        
        subject = 'Orden de compra #' + str(solicitud_id)
        # You can customize the email template according to your needs
        message_usuario = render_to_string('ocapp/solicitud_orden_compra_usuario.html', variables)
        message_administrador = render_to_string('ocapp/solicitud_orden_compra_administrador.html', variables)
        
        from_email = os.getenv("SENDGRID_EMAIL_SENDER")  # Sender's email address
        recipient_list_usuario = [email]  # Recipient's email address, use a list
        recipient_list_administrador = [os.getenv("SENDGRID_EMAIL_SENDER")]  # Recipient's email address, use a list
        
        try:
            # Send the email using Django's send_mail function
            send_mail(subject, message_usuario, from_email, recipient_list_usuario, html_message=message_usuario)
            send_mail(subject, message_administrador, from_email, recipient_list_administrador, html_message=message_administrador)
            
            return Response({'success': 'Correo electrónico enviado con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            # Handle any exceptions that may occur
            return Response({'error': f'Error al enviar el correo electrónico, error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    
    
    @action(detail=False, methods=['POST'])    
    def correo_solicitud_asignada(self, request):
        """
        A view to handle sending an email with order details to the user and administrator.
        
        Parameters:
        - request: Request object containing data needed for sending the email.
            - solicitud_id: ID of the order to be sent.
            - asignado_operador: ID of the operator assigned to the order.
        
        Returns:
        - Response object indicating the success or failure of sending the email.
        """
        # Se guardan datos del request en variables
        solicitud_id = request.data.get('id_solicitud')
        asignado_operador = request.data.get('asignado_operador')
        
        # Validación de datos
        if not all([solicitud_id, asignado_operador]):
            return Response({'error': 'Todos los campos son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            solicitud = Solicitud.objects.get(id_solicitud=solicitud_id)
            rut_usuario = solicitud.rut_usuario.rut_usuario
        except Solicitud.DoesNotExist:
            return Response({"error": "La solicitud no existe"}, status=status.HTTP_404_NOT_FOUND)

        # Fetch user details including email
        try:
            user = Usuario.objects.get(rut_usuario=rut_usuario)
            email = user.email
            nombre = user.nombre
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario solicitante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        # Fetch assigned operator details
        try:
            user_assigned = Usuario.objects.get(rut_usuario=asignado_operador)
            nombre_assigned = user_assigned.nombre
            email_assigned = user_assigned.email
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario operador no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        variables = {
            'empresa': 'DUOC UC - Gestión ordenes de compra',
            'solicitud_id': solicitud_id,
            'email': email,
            'nombre': nombre,
            'nombre_assigned': nombre_assigned,
            'email_assigned': email_assigned,
        }
        
        subject = 'Asignación de orden de compra #' + str(solicitud_id)
        # You can customize the email template according to your needs
        message_usuario = render_to_string('ocapp/solicitud_asignacion_usuario.html', variables)
        message_administrador = render_to_string('ocapp/solicitud_asignacion_administrador.html', variables)
        message_operator = render_to_string('ocapp/solicitud_asignacion_operador.html', variables)
        
        from_email = os.getenv("SENDGRID_EMAIL_SENDER")  # Sender's email address
        recipient_list_usuario = [email]  # Recipient's email address, use a list
        recipient_list_operator = [email_assigned]  # Recipient's email address, use a list
        recipient_list_administrador = [os.getenv("SENDGRID_EMAIL_SENDER")]  # Recipient's email address, use a list
        
        try:
            # Send the email using Django's send_mail function
            send_mail(subject, message_usuario, from_email, recipient_list_usuario, html_message=message_usuario)
            send_mail(subject, message_administrador, from_email, recipient_list_administrador, html_message=message_administrador)
            send_mail(subject, message_operator, from_email, recipient_list_operator, html_message=message_operator)
            
            return Response({'success': 'Correo electrónico enviado con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            # Handle any exceptions that may occur
            return Response({'error': f'Error al enviar el correo electrónico, error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    
    
    @action(detail=False, methods=['POST'])    
    def correo_solicitud_resuelta(self, request):
        """
        A function that processes a request to send an email notification about the resolution of a request. 
        It retrieves data from the request, validates it, fetches related objects, prepares email content, and sends emails to the user and administrator.
        Parameters:
            self: The instance of the class.
            request: The request object containing data about the resolution of a request.
        Returns:
            Response: A response object indicating the status of the email sending process.
        """
        
        # Se guardan datos del request en variables
        solicitud_id = request.data.get('solicitud_id')
        estado = request.data.get('estado')
        descripcion_operador = request.data.get('descripcion_operador')
        dinero_solicitud = request.data.get('dinero_solicitud')
        
        # Validación de datos
        if not all([solicitud_id, estado, dinero_solicitud]):
            return Response({'error': 'Todos los campos son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            solicitud = Solicitud.objects.get(id_solicitud=solicitud_id)
            rut_usuario = solicitud.rut_usuario.rut_usuario
            
            id_cuentacontable = solicitud.id_cuentacontable.id_cuentacontable
            
            try:
                # Intenta obtener la instancia de CuentaContable asociada a la solicitud
                cuentacontable = CuentaContable.objects.get(id_cuentacontable=id_cuentacontable)
                id_ceco = cuentacontable.id_ceco.id_ceco
                
                try:
                    # Intenta obtener la instancia de Ceco asociada a la instancia de CuentaContable
                    ceco = Ceco.objects.get(id_ceco=id_ceco)
                    dinero_disponible = ceco.presupuesto_disponible
                except Ceco.DoesNotExist:
                    return Response({"error": "El ceco no existe"}, status=status.HTTP_404_NOT_FOUND)
            except CuentaContable.DoesNotExist:
                return Response({"error": "La cuenta contable no existe"}, status=status.HTTP_404_NOT_FOUND)
            
        except Solicitud.DoesNotExist:
            return Response({"error": "La solicitud no existe"}, status=status.HTTP_404_NOT_FOUND)

        # Fetch user details including email
        try:
            user = Usuario.objects.get(rut_usuario=rut_usuario)
            email = user.email
            nombre = user.nombre
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario solicitante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        # Fetch assigned operator details

        variables = {
            'empresa': 'DUOC UC - Gestión ordenes de compra',
            'solicitud_id': solicitud_id,
            'email': email,
            'nombre': nombre,
            'estado': estado,
            'descripcion_operador': descripcion_operador,
            'dinero_solicitud': dinero_solicitud,
            'dinero_disponible': dinero_disponible,
        }
        
        subject = 'Actualización de estado de solicitud #' + str(solicitud_id)
        # You can customize the email template according to your needs
        message_usuario = render_to_string('ocapp/solicitud_resolucion_usuario.html', variables)
        message_administrador = render_to_string('ocapp/solicitud_resolucion_administrador.html', variables)
        # message_operator = render_to_string('ocapp/solicitud_resolucion_operador.html', variables)
        
        from_email = os.getenv("SENDGRID_EMAIL_SENDER")  # Sender's email address
        recipient_list_usuario = [email]  # Recipient's email address, use a list
        # recipient_list_operator = [email_assigned]  # Recipient's email address, use a list
        recipient_list_administrador = [os.getenv("SENDGRID_EMAIL_SENDER")]  # Recipient's email address, use a list
        
        try:
            # Send the email using Django's send_mail function
            send_mail(subject, message_usuario, from_email, recipient_list_usuario, html_message=message_usuario)
            send_mail(subject, message_administrador, from_email, recipient_list_administrador, html_message=message_administrador)
            # send_mail(subject, message_operator, from_email, recipient_list_operator, html_message=message_operator)
            
            return Response({'success': 'Correo electrónico enviado con éxito'}, status=status.HTTP_200_OK)
        except Exception as e:
            # Handle any exceptions that may occur
            return Response({'error': f'Error al enviar el correo electrónico, error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    
    