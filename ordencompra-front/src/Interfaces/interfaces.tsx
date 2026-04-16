export interface Proveedor {
    id_proveedor: number;
    rut_proveedor: string;
    nombre_proveedor: string;
    direccion: string;
}

export interface Cotizaciones {
    id_cotizacion: number;
    id_solicitud: number;
    rut_proveedor: string;
    nombre_contacto_proveedor: string;
    telefono_contacto_proveedor: string;
    correo_contacto_proveedor: string;
    cotizaciones_archivo: {
        name: string;
        type: string;
        size: string;
        path: string;
        lastModifiedDate: string;
    }
    seleccionado: boolean;
}

export interface Solicitud {
    id_solicitud: number;
    cuadro_comparativo_archivo: {
        name: string;
        type: string;
        size: string;
        path: string;
        lastModifiedDate: string;
    },
    soc_archivo: {
        name: string;
        type: string;
        size: string;
        path: string;
        lastModifiedDate: string;
    },
    descripcion: string;
    estado: string;
    rut_usuario: number;
    id_cuentacontable: number;

}

export interface Usuarios {
    rut_usuario: string;
    rol: string;
    nombre: string;
    area: string;
}

export interface Ceco {
    id_ceco: number;
    nombre_ceco: string;
    presupuesto: string;
}

export interface SolicitudDeUsuario {
    id_solicitud: number;
    cuadro_comparativo_archivo: string;
    soc_archivo: string;
    descripcion: string;
    estado: string;
    asignado_operador: number;
    rut_usuario: number;
    id_cuentacontable: number;
}

export interface SolicitudDeUsuarioConFecha {
    id_solicitud: number;
    cuadro_comparativo_archivo: string;
    soc_archivo: string;
    descripcion: string;
    estado: string;
    asignado_operador: number;
    rut_usuario: number;
    id_cuentacontable: number;
    fecha_recibida: Date;
    nombre_usuario: string;
}

export interface CotizacionesDeUsuario {
    id_cotizacion: number;
    id_solicitud: number;
    rut_proveedor: string;
    nombre_contacto_proveedor: string;
    telefono_contacto_proveedor: string;
    correo_contacto_proveedor: string;
    cotizaciones_archivo: string;
    seleccionado: boolean;
}

export interface CuentasContables {
        id_cuentacontable: number;
        id_ceco: number;
}

export interface Area {
    id_area: number;
    nombre_area: string;
    id_ceco: number;
}

export interface FechasSolicitud {
    id_solicitud: number;
    fecha_recibida: Date;
    fecha_asignada: Date;
    fecha_en_progreso: Date;
    fecha_finalizada: Date;
}
