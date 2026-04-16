from ..models import Proveedor
from rest_framework import viewsets, permissions, status
from ..serializers import ProveedorSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['GET'])
    def buscar_por_rut(self, request):
        """
        Searches for a Proveedor by its RUT.
        
        params:
        - rut_proveedor: The RUT of the Proveedor to search for.
        """
        rut = request.query_params.get('rut_proveedor')
        if not rut:
            return Response({'error': 'Debes proporcionar un RUT en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            proveedor = Proveedor.objects.get(rut_proveedor=rut)
            serializer = self.get_serializer(proveedor)
            return Response(serializer.data)
        except Proveedor.DoesNotExist:
            return Response({'error': 'Proveedor no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
    def create(self, request):
        """
        Create a new Proveedor object based on the data passed in the request.

        :param request: The request object containing data for the new Proveedor.
        :return: A response with the newly created Proveedor data if successful, or an error message if a Proveedor with the same RUT already exists.
        """

        rut = request.data.get('rut_proveedor')
        nombre_proveedor = request.data.get('nombre_proveedor')
        direccion = request.data.get('direccion')
        #Eliminar los puntos del rut
        rut = rut.replace('.', '').replace('k', 'K')

        if Proveedor.objects.filter(rut_proveedor=rut).exists():
            return Response({'error': 'Ya existe un proveedor con este RUT.'}, status=status.HTTP_400_BAD_REQUEST)

        # Convertir nombre_proveedor y direccion a mayúsculas
        nombre_proveedor = nombre_proveedor.upper()
        direccion = direccion.upper()

        # Crea el Proveedor
        proveedor = Proveedor(rut_proveedor=rut, nombre_proveedor=nombre_proveedor, direccion=direccion)
        proveedor.save()

        # Devuelve una respuesta exitosa
        response_serializer = ProveedorSerializer(proveedor, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
