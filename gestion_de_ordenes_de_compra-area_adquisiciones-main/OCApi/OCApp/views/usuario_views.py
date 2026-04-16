from django.contrib.auth import get_user_model
from ..models import Area, Usuario
from rest_framework import viewsets, permissions, status
from ..serializers import UsuarioSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

from django.core.mail import send_mail
from django.template.loader import render_to_string

# for env variables
import os
from dotenv import load_dotenv

load_dotenv()

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('-date_joined')
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['POST'])
    # Funcion para crear SuperUduario
    def crear_usuario(self, request):
        """
        Funcion para crear Usuario
        """
        
        # Se guardan datos del request en variables
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        rut_usuario = request.data.get('rut_usuario')
        rol = request.data.get('rol')
        nombre = request.data.get('nombre')
        area = request.data.get('area')

        #Eliminar los puntos del rut
        rut_usuario = rut_usuario.replace('.', '').replace('k', 'K')

        # Validaciones de si ya existe
        if get_user_model().objects.filter(username=username).exists():
            return Response({'error': 'El nombre de usuario ya existe'}, status=status.HTTP_400_BAD_REQUEST)
        
        if get_user_model().objects.filter(rut_usuario=rut_usuario).exists():
            return Response({'error': 'El Rut ya tiene registrada una cuenta'}, status=status.HTTP_400_BAD_REQUEST)
        
        if get_user_model().objects.filter(email=email).exists():
            return Response({'error': 'El Correo ya tiene registrada una cuenta'}, status=status.HTTP_400_BAD_REQUEST)
        
        if isinstance(area, str):
            area = int(area.split('/')[-2])

        if not Area.objects.filter(id_area=area).exists():
            return Response({'error': 'Area no existe'}, status=status.HTTP_400_BAD_REQUEST)
        
        instanciaArea = Area.objects.get(id_area=area)

        # Crea el Usuario
        superuser = get_user_model().objects.create_superuser(username=username, email=email, password=password, rut_usuario=rut_usuario, rol=rol, nombre=nombre, area=instanciaArea)
        
        # Devuelve una respuesta exitosa
        response_serializer = UsuarioSerializer(superuser, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['PATCH'])
    def editar_usuario(self, request):
        """
        Edit a specific user with the provided data.
        
        params:
            - nombre
            - email
            - rut_usuario
            - rol
            - area
            
        """
        rut_usuario = request.data.get('rut_usuario')
        rol = request.data.get('rol')
        nombre = request.data.get('nombre')
        area = request.data.get('area')
        email = request.data.get('email')

        try:
            usuario = Usuario.objects.get(rut_usuario=rut_usuario)
        except Usuario.DoesNotExist:
            return Response({"error": "El usuario no existe"}, status=status.HTTP_404_NOT_FOUND)

        if not Area.objects.filter(id_area=area).exists():
            return Response({'error': 'Area no existe'}, status=status.HTTP_400_BAD_REQUEST)
        
        instanciaArea = Area.objects.get(id_area=area)

        # Actualiza los campos específicos de la solicitud
        usuario.nombre = nombre
        usuario.email = email
        usuario.rol = rol
        usuario.area = instanciaArea
        usuario.save()

        serializer = self.get_serializer(usuario)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['GET'])
    def obtener_datos_usuarios(self, request):
        """
        A view to retrieve a list of all users with certain fields, excluding sensitive information.
        """
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True, context={'request': request})
        
        data = []
        for user in serializer.data:
            user_data = {
                "username": user.get("username", None),
                "email": user.get("email", None),
                "rut_usuario": user.get("rut_usuario", None),
                "rol": user.get("rol", None),
                "nombre": user.get("nombre", None),
                "area": user.get("area", None)
            }
            data.append(user_data)
        
        return Response(data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['GET'])
    def obtener_datos_operadores(self, request):
        """
        A view that retrieves data for operators without showing sensitive information.
        """
        usuarios = Usuario.objects.filter(rol='Operador')
        serializer = UsuarioSerializer(usuarios, many=True, context={'request': request})

        # Excluir 'id' y 'password' de la respuesta
        data = [{ "email": user["email"], "rut_usuario": user["rut_usuario"],
                "rol": user["rol"], "nombre": user["nombre"]} for user in serializer.data]

        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def obtener_datos_usuario_segun_rut(self, request):
        """
        This function obtains user data based on the provided 'rut_usuario' query parameter.
        It takes a 'request' rut_usuario parameter and returns a Response containing user data or an error message.
        """
        rut_usuario = request.query_params.get('rut_usuario')    

        if not rut_usuario:
            return Response({'error': 'Se requiere el rut_usuario.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuario.objects.get(rut_usuario=rut_usuario)
            serializer = UsuarioSerializer(usuario, many=False, context={'request': request})

            data = {
                "email": serializer.data["email"],
                "rut_usuario": serializer.data["rut_usuario"],
                "rol": serializer.data["rol"],
                "nombre": serializer.data["nombre"],
                "area": usuario.area.id_area
            }
            return Response(data, status=status.HTTP_200_OK)
        
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['GET'], permission_classes=[permissions.AllowAny])
    def obtener_rol_usuario(self, request):
        """
        A function to obtain the role of a user by ID and return it as a response.
        """
        try:
            # Buscar el usuario por ID
            id = request.query_params.get('id')
            
            # Obtener el usuario o devolver 404 si no existe
            usuario = Usuario.objects.get(id=id)
            
            # Obtener el rol del usuario
            rol_usuario = usuario.rol
            
            return Response({'rol': rol_usuario}, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            # Si el usuario no se encuentra, retornar un código 200 con rol vacío
            return Response({'rol': 'Sin Rol'}, status=status.HTTP_200_OK)
        
    @action(detail=False, methods=['POST'], permission_classes=[permissions.AllowAny])    
    def correo_solicitar_cuenta(self, request):
        """
        Sends an email to the Administrator to request a new account with the information they provided.
        """
        # Se guardan datos del request en variables
        email = request.data.get('email')
        rut_usuario = request.data.get('rut_usuario')
        nombre = request.data.get('nombre')
        area = request.data.get('area')
        extrainfo = request.data.get('extrainfo')

        # Validación de datos
        if not all([email, rut_usuario, nombre, area]):
            return Response({'error': 'Todos los campos excepto "extrainfo" son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        variables = {
            'empresa': 'DUOC UC - Gestión ordenes de compra',
            'email': email,
            'rut_usuario': rut_usuario,
            'nombre': nombre,
            'area': area,
            'extrainfo': extrainfo
        }
        
        subject = 'Solicitud de cuenta'
        # You can customize the email template according to your needs
        message_usuario = render_to_string('ocapp/solicitud_cuenta_usuario.html', variables)
        message_administrador = render_to_string('ocapp/solicitud_cuenta_administrador.html', variables)
        
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
