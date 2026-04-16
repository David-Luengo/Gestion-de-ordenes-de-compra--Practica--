"""
URL configuration for OCApi project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers

from OCApp.views.usuario_views import UsuarioViewSet
from OCApp.views.ceco_views import CecoViewSet
from OCApp.views.proveedor_views import ProveedorViewSet
from OCApp.views.solicitud_views import SolicitudViewSet
from OCApp.views.cotizacion_views import CotizacionViewSet
from OCApp.views.cuentacontable_views import CuentaContableViewSet
from OCApp.views.registrogasto_views import RegistroGastoViewSet
from OCApp.views.fechaestado_views import FechaEstadoViewSet
from OCApp.views.area_views import AreaViewSet

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

router = routers.DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'cecos', CecoViewSet)
router.register(r'proveedores', ProveedorViewSet)
router.register(r'solicitudes', SolicitudViewSet)
router.register(r'cotizaciones', CotizacionViewSet)
router.register(r'cuentacontable', CuentaContableViewSet)
router.register(r'registrogasto', RegistroGastoViewSet)
router.register(r'fechaestado', FechaEstadoViewSet)
router.register(r'area', AreaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
