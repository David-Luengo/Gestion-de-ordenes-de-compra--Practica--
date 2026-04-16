from ..models import Proveedor, Solicitud, Cotizacion
from rest_framework import viewsets, permissions, status
from ..serializers import CotizacionSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class CotizacionViewSet(viewsets.ModelViewSet):
    queryset = Cotizacion.objects.all()
    serializer_class = CotizacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['GET'])
    def cotizaciones_por_solicitud(self, request):
        """
        Retrieves and returns the cotizaciones for a given solicitud ID.

        Args:
            self: The object instance
            request: The request object containing the query parameters

        Returns:
            Response: A JSON response containing the cotizaciones data and status code
        """
        id_solicitud = request.query_params.get('id_solicitud')
        if not id_solicitud:
            return Response({'error': 'Debes proporcionar un id_solicitud en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # Filtra las solicitudes por el ID de usuario especificado
            cotizaciones = Cotizacion.objects.filter(id_solicitud=id_solicitud)
            serializer = self.get_serializer(cotizaciones, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Cotizacion.DoesNotExist:
            return Response({'error': 'No se encontraron cotizaciones para esta solicitud.'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=['GET'])
    def cotizaciones_por_usuario(self, request):
        """
        A description of the entire function, its parameters, and its return types.
        """
        userid = request.query_params.get('userid')

        # Obtén todas las solicitudes asociadas al rut_usuario
        solicitudes = Solicitud.objects.filter(rut_usuario=userid)
        
        # Obtén todas las cotizaciones asociadas a esas solicitudes
        cotizaciones = Cotizacion.objects.filter(id_solicitud__in=solicitudes)

        serializer = self.get_serializer(cotizaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['GET'])
    def cotizaciones_por_operador(self, request):
        """
        A view to retrieve all quotations associated with requests assigned to the operator.
        """
        id = request.query_params.get('id')

        # Obtén todas las solicitudes asignadas al operador
        solicitudes_asignadas = Solicitud.objects.filter(asignado_operador__id=id)

        # Obtén todas las cotizaciones asociadas a esas solicitudes
        cotizaciones = Cotizacion.objects.filter(id_solicitud__in=solicitudes_asignadas)

        serializer = self.get_serializer(cotizaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    def create(self, request):
        """
        Create a new Cotizacion object with the provided data in the request.
        
        Parameters:
            request: The request object containing data for creating the Cotizacion.
        
        Returns:
            Response: A response with the newly created Cotizacion data and a status of HTTP 201 Created.
        """

        id_solicitud = request.data.get('id_solicitud')
        rut_proveedor = request.data.get('rut_proveedor')
        nombre_contacto_proveedor = request.data.get('nombre_contacto_proveedor')
        telefono_contacto_proveedor = request.data.get('telefono_contacto_proveedor')
        correo_contacto_proveedor = request.data.get('correo_contacto_proveedor')
        cotizaciones_archivo = request.data.get('cotizaciones_archivo')
        # Convertir el valor de 'seleccionado' a un booleano
        seleccionado = request.data.get('seleccionado') == 'true'

        #Eliminar el + del telefono_contacto_proveedor
        if telefono_contacto_proveedor is not None:
            telefono_contacto_proveedor = telefono_contacto_proveedor.replace('+', '')

        # Convertir nombre_contacto_proveedor a mayúsculas si no es None
        if nombre_contacto_proveedor is not None:
            nombre_contacto_proveedor = nombre_contacto_proveedor.upper()

        # Convertir correo_contacto_proveedor a minusculas si no es None
        if correo_contacto_proveedor is not None:
            correo_contacto_proveedor = correo_contacto_proveedor.lower()

        # Obtener instancia de solicitud y rut_proveedor
        instanciaSolicitud = Solicitud.objects.get(id_solicitud=id_solicitud)

        instanciaProveedor = Proveedor.objects.get(rut_proveedor=rut_proveedor)

        # Crea el Proveedor
        cotizacion = Cotizacion(id_solicitud=instanciaSolicitud, rut_proveedor=instanciaProveedor, nombre_contacto_proveedor=nombre_contacto_proveedor,
                                telefono_contacto_proveedor=telefono_contacto_proveedor,correo_contacto_proveedor=correo_contacto_proveedor,seleccionado=seleccionado
                                )
        
        if cotizaciones_archivo is not None:
            cotizacion.cotizaciones_archivo = cotizaciones_archivo

        cotizacion.save()

        # Devuelve una respuesta exitosa
        response_serializer = CotizacionSerializer(cotizacion, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
