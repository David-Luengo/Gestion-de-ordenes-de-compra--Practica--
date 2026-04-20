from ..models import Area, Ceco
from rest_framework import viewsets, permissions, status
from ..serializers import AreaSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes_by_action = {
        "default": [permissions.IsAuthenticated],
        "list": [permissions.AllowAny],
    }
    
    # Este es un auto llamado para obtener los permisos
    def get_permissions(self):
        """
        A method to retrieve permission classes based on the `action` attribute.
        """
        try:
            # return permission_classes depending on `action`
            return [
                permission()
                for permission in self.permission_classes_by_action[self.action]
            ]
        except KeyError:
            # action is not set return default permission_classes
            return [
                permission()
                for permission in self.permission_classes_by_action["default"]
            ]

    def create(self, request):
        """
        create function to create Area instance with given nombre_area and id_ceco
        
        :param request: request object containing data for nombre_area and id_ceco
        :return: Response object indicating success or error
        """

        nombre_area = request.data.get('nombre_area')
        id_ceco = request.data.get('id_ceco')
        
        # Convertir nombre_ceco a mayúsculas
        nombre_area = nombre_area.upper()

        if Area.objects.filter(nombre_area=nombre_area).exists():
            # Devolver una respuesta indicando que el nombre_area ya existe
            return Response({'error': 'Ya existe un Area con este nombre'}, status=status.HTTP_400_BAD_REQUEST)

        if Area.objects.filter(id_ceco=id_ceco).exists():
            # Devolver una respuesta indicando que el nombre_area ya existe
            return Response({'error': 'Ya existe un Area con este id ceco'}, status=status.HTTP_400_BAD_REQUEST)

        if not Ceco.objects.filter(id_ceco=id_ceco).exists():
            # Devolver una respuesta indicando que el id_ceco ya existe
            return Response({'error': 'No existe un Ceco con este id'}, status=status.HTTP_400_BAD_REQUEST)
        
        instancia_ceco = Ceco.objects.get(id_ceco=id_ceco)

        try:
            # Crea el Proveedor
            area = Area(nombre_area=nombre_area, id_ceco=instancia_ceco)
            area.save()
            response_serializer = AreaSerializer(area, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['PATCH'])
    def editar_area(self, request):
        """
        A description of the entire function, its parameters, and its return types.
        """
        nombre_area = request.data.get('nombre_area')
        id_ceco = request.data.get('id_ceco')

        try:
            area = Area.objects.get(nombre_area=nombre_area)
        except Area.DoesNotExist:
            return Response({"error": "El area no existe"}, status=status.HTTP_404_NOT_FOUND)

        try:
            instanciaCeco = Ceco.objects.get(id_ceco=id_ceco)        
        except Area.DoesNotExist:
            return Response({"error": "El id ceco no existe"}, status=status.HTTP_404_NOT_FOUND)
        # Actualiza los campos específicos del Area
        area.nombre_area = nombre_area
        area.id_ceco = instanciaCeco
        area.save()

        serializer = self.get_serializer(area)
        return Response(serializer.data, status=status.HTTP_200_OK)
