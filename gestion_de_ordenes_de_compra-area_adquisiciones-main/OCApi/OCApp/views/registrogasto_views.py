from ..models import RegistroGasto
from rest_framework import viewsets, permissions
from ..serializers import RegistroGastoSerializer

class RegistroGastoViewSet(viewsets.ModelViewSet):
    queryset = RegistroGasto.objects.all()
    serializer_class = RegistroGastoSerializer
    permission_classes = [permissions.IsAuthenticated]