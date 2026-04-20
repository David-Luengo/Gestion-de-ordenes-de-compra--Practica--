from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from OCApp.models import Ceco, Area, CuentaContable

class Command(BaseCommand):
    help = 'Carga datos de prueba en la base de datos'

    def handle(self, *args, **options):
        # Crear instancias de Ceco
        ceco1 = Ceco.objects.create(id_ceco=1000,nombre_ceco='CECO IVARAS', presupuesto_original=100000,presupuesto_disponible=1000000)

        # Crear instancias de Area asociadas a los Ceco
        area1 = Area.objects.create(id_area=1000,nombre_area='AREA IVARAS', id_ceco=ceco1)

        # Crear instancias de CuentaContable asociadas a los Ceco
        cuenta_contable1 = CuentaContable.objects.create(id_cuentacontable=100,id_ceco=ceco1)
        cuenta_contable1 = CuentaContable.objects.create(id_cuentacontable=101,id_ceco=ceco1)
        cuenta_contable1 = CuentaContable.objects.create(id_cuentacontable=102,id_ceco=ceco1)

        # Crear instancias de Usuario
        User = get_user_model()
        user1 = User.objects.create_superuser(username='solicitante', email='solicitante@duocuc.cl', password='solicitante', rut_usuario='26580508-6', rol='Solicitante', nombre='SOLICITANTE', area=area1)
        user2 = User.objects.create_superuser(username='operador', email='operador@duocuc.cl', password='operador', rut_usuario='27756711-3', rol='Operador', nombre='OPERADOR', area=area1)
        user2 = User.objects.create_superuser(username='administrador', email='administrador@duocuc.cl', password='administrador', rut_usuario='28609857-6', rol='Administrador', nombre='ADMINISTRADOR', area=area1)

        self.stdout.write(self.style.SUCCESS('Datos de prueba cargados exitosamente.'))