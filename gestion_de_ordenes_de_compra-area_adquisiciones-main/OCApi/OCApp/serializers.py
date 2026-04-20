from rest_framework import serializers
from .models import Area, Ceco, Usuario, Proveedor, Solicitud, Cotizacion,CuentaContable,RegistroGasto, FechaEstado
from django.conf import settings
# Serializador para el modelo Ceco
class CecoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ceco
        fields = ('id_ceco', 'nombre_ceco', 'presupuesto_original','presupuesto_disponible')

# Serializador para el modelo Usuario
class UsuarioSerializer(serializers.HyperlinkedModelSerializer):
    area = serializers.CharField(source='area.nombre_area', read_only=True)
    class Meta:
        model = Usuario
        fields = ('id', 'username', 'rut_usuario', 'rol', 'nombre', 'area', 'password', 'email')

# Serializador para el modelo Area
class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ('id_area', 'nombre_area', 'id_ceco')


# Serializador para el modelo Proveedor
class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ('id_proveedor', 'rut_proveedor', 'nombre_proveedor', 'direccion')

# Serializador para el modelo Solicitud
class SolicitudSerializer(serializers.ModelSerializer):

    class Meta:
        model = Solicitud
        fields = ('id_solicitud', 'cuadro_comparativo_archivo', 'soc_archivo', 'descripcion', 'estado', 'asignado_operador', 'rut_usuario', 'id_cuentacontable','descripcion_operador')
    def to_representation(self, instance):

        if instance.asignado_operador:
            custom_asignado_operador = instance.asignado_operador.nombre
        else:
            custom_asignado_operador = 'SIN ASIGNAR'

        if instance.rut_usuario:
            custom_rut = instance.rut_usuario.rut_usuario
        else:
            custom_rut = 'Nulo'

        data = super().to_representation(instance)
        
        data['asignado_operador'] = custom_asignado_operador
        data['rut_usuario'] = custom_rut

        # Construir manualmente la URL completa para el cuadro_comparativo_archivo
        cuadro_comparativo_archivo_relative_url = instance.cuadro_comparativo_archivo.url
        cuadro_comparativo_archivo_full_url = f"{settings.BASE_URL}{cuadro_comparativo_archivo_relative_url}"
        data['cuadro_comparativo_archivo'] = cuadro_comparativo_archivo_full_url

        # Construir manualmente la URL completa para el soc_archivo
        soc_archivo_full_relative_url = instance.soc_archivo.url
        soc_archivo_full_url = f"{settings.BASE_URL}{soc_archivo_full_relative_url}"
        data['soc_archivo'] = soc_archivo_full_url
        return data
    
# Serializador para el modelo CuentaContable
class CuentaContableSerializer(serializers.ModelSerializer):
    class Meta:
        model = CuentaContable
        fields = ('id_cuentacontable', 'id_ceco')
    
# Serializador para el modelo Cotizacion
class CotizacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cotizacion
        fields = ('id_cotizacion', 'id_solicitud', 'rut_proveedor', 'nombre_contacto_proveedor', 'telefono_contacto_proveedor', 'correo_contacto_proveedor', 'cotizaciones_archivo','seleccionado')

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Verificar si cotizaciones_archivo no es nulo antes de construir la URL completa
        if instance.cotizaciones_archivo:
            cotizaciones_archivo_relative_url = instance.cotizaciones_archivo.url
            cotizaciones_archivo_full_url = f"{settings.BASE_URL}{cotizaciones_archivo_relative_url}"
            data['cotizaciones_archivo'] = cotizaciones_archivo_full_url
        else:
            data['cotizaciones_archivo'] = None

        return data
# Serializador para el modelo Cotizacion
class RegistroGastoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroGasto
        fields = ['id_registro', 'id_solicitud', 'id_cuentacontable', 'fecha', 'monto']
        
# Serializador para el modelo Cotizacion
class FechaEstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FechaEstado
        fields = ['id_solicitud', 'fecha_recibida', 'fecha_asignada', 'fecha_en_progreso', 'fecha_finalizada']
