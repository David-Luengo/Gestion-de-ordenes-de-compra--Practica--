from ..models import FechaEstado
from rest_framework import viewsets, permissions
from ..serializers import FechaEstadoSerializer

class FechaEstadoViewSet(viewsets.ModelViewSet):
    queryset = FechaEstado.objects.all()
    serializer_class = FechaEstadoSerializer
    permission_classes = [permissions.IsAuthenticated]