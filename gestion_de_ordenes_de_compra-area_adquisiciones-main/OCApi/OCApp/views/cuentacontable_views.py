from ..models import Usuario,CuentaContable
from rest_framework import viewsets, status
from ..serializers import CuentaContableSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class CuentaContableViewSet(viewsets.ModelViewSet):
    queryset = CuentaContable.objects.all()
    serializer_class = CuentaContableSerializer 
        
    @action(detail=False, methods=['GET'])
    def cuentas_contables_por_usuario(self, request):
        """
        A view to retrieve a list of accounting accounts related to a user based on the user_id provided in the request.
        
        Parameters:
        - request: the request object containing the user_id in the query parameters
        
        Returns:
        - Response: a JSON response with the list of accounting accounts related to the user or an error message if the user or accounts are not found
        """
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'Debes proporcionar un user_id en la consulta.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Busca al usuario con el ID proporcionado
            usuario = Usuario.objects.get(id=user_id)
            
            # Obtiene el ceco del usuario
            ceco_usuario = usuario.area.id_ceco

            # Filtra las cuentas contables relacionadas con ese ceco
            cuentas_contables = CuentaContable.objects.filter(id_ceco=ceco_usuario)
            
            serializer = self.get_serializer(cuentas_contables, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({'error': 'No se encontró el usuario especificado.'}, status=status.HTTP_404_NOT_FOUND)
        except CuentaContable.DoesNotExist:
            return Response({'error': 'No se encontraron cuentas contables para este usuario.'}, status=status.HTTP_404_NOT_FOUND)
