from django.db import models
from django.contrib.auth.models import AbstractUser

# Modelo para la tabla Ceco
class Ceco(models.Model):
    id_ceco = models.IntegerField(primary_key=True)
    nombre_ceco = models.CharField(max_length=255)
    presupuesto_original = models.IntegerField()
    presupuesto_disponible = models.IntegerField()

# Modelo para la tabla Area
class Area(models.Model):
    id_area = models.AutoField(primary_key=True)
    nombre_area = models.CharField(max_length=255)
    id_ceco = models.ForeignKey(Ceco, on_delete=models.CASCADE)

# Modelo para la tabla Usuario
class Usuario(AbstractUser):
    rut_usuario = models.CharField(unique=True, max_length=15)
    ROLES = (('Operador', 'Operador'),
            ('Solicitante', 'Solicitante'),
            ('Administrador', 'Administrador'))
    rol = models.CharField(max_length=255,choices=ROLES)
    nombre = models.CharField(max_length=255)
    area = models.ForeignKey(Area, on_delete=models.CASCADE,null=True)
    def __str__(self):
        return self.nombre

# Modelo para la tabla Proveedores
class Proveedor(models.Model):
    id_proveedor = models.AutoField(primary_key=True)
    rut_proveedor = models.CharField(unique=True,max_length=15)
    nombre_proveedor = models.CharField(max_length=255)
    direccion = models.CharField(max_length=255)
    def __str__(self):
        return self.rut_proveedor
    
# Modelo para la tabla CuentaContable
class CuentaContable(models.Model):
    id_cuentacontable = models.IntegerField(primary_key=True) 
    id_ceco = models.ForeignKey(Ceco, on_delete=models.CASCADE)  

# Modelo para la tabla solicitudes
class Solicitud(models.Model):
    id_solicitud = models.AutoField(primary_key=True)
    cuadro_comparativo_archivo = models.FileField(upload_to='cuadros_comparativos_pdf')
    soc_archivo = models.FileField(upload_to='solicitud_orden_compra_pdf')
    descripcion = models.TextField()
    descripcion_operador = models.TextField(null=True)
    ESTADOS = (('Recibida', 'Recibida'),
               ('Asignada', 'Asignada'),
               ('En progreso', 'En progreso'),
               ('Aprobada', 'Aprobada'),
               ('Rechazada', 'Rechazada'),)
    estado = models.CharField(max_length=50, choices=ESTADOS)
    rut_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='solicitudes_realizadas')
    asignado_operador = models.ForeignKey(Usuario, on_delete=models.CASCADE,null=True, related_name='solicitudes_asignadas')
    id_cuentacontable = models.ForeignKey(CuentaContable, on_delete=models.CASCADE)

# Modelo para la tabla cotizaciones
class Cotizacion(models.Model):
    id_cotizacion = models.AutoField(primary_key=True)
    id_solicitud = models.ForeignKey(Solicitud, on_delete=models.CASCADE)
    rut_proveedor = models.ForeignKey(Proveedor, to_field='rut_proveedor', on_delete=models.CASCADE, blank=True, null=True)
    nombre_contacto_proveedor = models.CharField(max_length=255, blank=True)
    telefono_contacto_proveedor = models.CharField(max_length=255, blank=True)
    correo_contacto_proveedor = models.CharField(max_length=255, blank=True)
    cotizaciones_archivo = models.FileField(upload_to='archivos_cotizaciones_pdf', null=True)
    seleccionado = models.BooleanField(default=False)

# Modelo para la tabla RegistroGasto
class RegistroGasto(models.Model):
    id_registro = models.AutoField(primary_key=True)
    id_solicitud = models.ForeignKey(Solicitud, on_delete=models.CASCADE)
    id_cuentacontable = models.ForeignKey(CuentaContable, on_delete=models.CASCADE)
    fecha = models.DateTimeField()
    monto = models.IntegerField()

# Modelo para la tabla FechaEstado
class FechaEstado(models.Model):
    id_solicitud = models.OneToOneField(Solicitud, primary_key=True, on_delete=models.CASCADE)
    fecha_recibida = models.DateTimeField(null=True)
    fecha_asignada = models.DateTimeField(null=True)
    fecha_en_progreso = models.DateTimeField(null=True)
    fecha_finalizada = models.DateTimeField(null=True)