from ..models import Ceco, Usuario
from rest_framework import viewsets, permissions, status
from ..serializers import  CecoSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class CecoViewSet(viewsets.ModelViewSet):
    queryset = Ceco.objects.all()
    serializer_class = CecoSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['GET'])
    def ver_ceco_solicitante(self, request):
        """
        A view to retrieve and return the Ceco associated with the area of a given user.
        
        Parameters:
            request (Request): The request object containing the user_id in the query parameters.
        
        Returns:
            Response: JSON response with the Ceco data related to the user's area.
        """
        user_id = request.query_params.get('user_id')

        if not user_id:
            return Response({'error': 'Debes proporcionar un user_id en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Obtiene el área del usuario
            area_del_usuario = Usuario.objects.get(id=user_id).area

            # Obtiene el Ceco asociado al área del usuario
            ceco_del_usuario = Ceco.objects.get(area__id_area=area_del_usuario.id_area)

            serializer = self.get_serializer([ceco_del_usuario], many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        except Ceco.DoesNotExist:
            return Response({'error': 'No se encontró un Ceco para este usuario.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['PATCH'])
    def editar_ceco(self, request):
        """
        A view to edit a specific cost center (ceco) with the provided data.
        
        params: 
            request (Request): The request object containing the cost center data in the request body, nombre_ceco, presupuesto_original, presupuesto_disponible
        """
        nombre_ceco = request.data.get('nombre_ceco')
        presupuesto_original = request.data.get('presupuesto_original')
        presupuesto_disponible = request.data.get('presupuesto_disponible')
        try:
            ceco = Ceco.objects.get(nombre_ceco=nombre_ceco)
        except Ceco.DoesNotExist:
            return Response({"error": "El ceco no existe"}, status=status.HTTP_404_NOT_FOUND)

        # Actualiza los campos específicos del ceco
        ceco.nombre_ceco = nombre_ceco
        ceco.presupuesto_original = presupuesto_original
        ceco.presupuesto_disponible = presupuesto_disponible

        serializer = self.get_serializer(ceco)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def create(self, request):
        """
        Create a new Ceco with the provided data.

        Parameters:
        - request: the HTTP request containing the data for the new Ceco.

        Returns:
        - Response: the HTTP response indicating the result of the creation process.
        """
        id_ceco = request.data.get('id_ceco')
        nombre_ceco = request.data.get('nombre_ceco')
        presupuesto_original = request.data.get('presupuesto_original')
        
        # Convertir nombre_ceco a mayúsculas
        nombre_ceco = nombre_ceco.upper()

        # Verificar si el id_ceco ya existe
        if Ceco.objects.filter(id_ceco=id_ceco).exists():
            # Devolver una respuesta indicando que el id_ceco ya existe
            return Response({'error': 'Ya existe un Ceco con este id'}, status=status.HTTP_400_BAD_REQUEST)

        if Ceco.objects.filter(nombre_ceco=nombre_ceco).exists():
            # Devolver una respuesta indicando que el id_ceco ya existe
            return Response({'error': 'Ya existe un Ceco con este nombre'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Crea el Proveedor
            ceco = Ceco(id_ceco=id_ceco, nombre_ceco=nombre_ceco, presupuesto_original=presupuesto_original, presupuesto_disponible=presupuesto_original)
            ceco.save()
            response_serializer = CecoSerializer(ceco, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
