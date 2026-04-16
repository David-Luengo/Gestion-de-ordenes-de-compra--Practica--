from django.contrib import admin
from .models import Area, Ceco, Usuario, Proveedor, Solicitud, Cotizacion,RegistroGasto,CuentaContable,FechaEstado

admin.site.register(Usuario)
admin.site.register(Ceco)
admin.site.register(Proveedor)
admin.site.register(Solicitud)
admin.site.register(Cotizacion)
admin.site.register(RegistroGasto)
admin.site.register(CuentaContable)
admin.site.register(FechaEstado)
admin.site.register(Area)