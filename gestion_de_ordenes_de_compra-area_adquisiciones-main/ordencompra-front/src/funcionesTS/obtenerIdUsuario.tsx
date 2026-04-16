import axios from "axios";
import jwt_decode from "jwt-decode";

export function obtenerIdUsuario(): number {
    try {
        // Recupera el token del Session Storage
        const token = sessionStorage.getItem('session_token');

        if (token) {
            try {
                // Decodificar el token JWT
                const decodedToken: any = jwt_decode(token);
                // Extraer el campo "id" del token decodificado
                if (typeof decodedToken.user_id === 'number') {
                    const idusuario: number = (decodedToken.user_id);
                    return idusuario
                }
                return 0
            } catch (error) {
                console.error("Error al decodificar el token:", error);
                window.location.reload();
                return 0
            }
        } else {
            // console.error("Token no encontrado en el Session Storage");
            return 0
        }
    } catch (error) {
        console.error("Error al obtener ID del Usuario:", error);
        window.location.reload();
        return 0
    }
}

export async function obtenerRolUsuario(): Promise<string> {
    try {
        const idusuario = obtenerIdUsuario();
        if(idusuario===0){
        return '';
        }
        const response = await axios.get(`/usuarios/obtener_rol_usuario/?id=${idusuario}`);
        const rol: string = response.data.rol;
        return rol;
    } catch (error) {
        // console.error("Error al obtener Rol del Usuario:", error);
        return '';
    }
}

export async function verificarRolAutentico(rolUsuario: string): Promise<boolean> {
    try {
        const rol: any = await obtenerRolUsuario();
        if (rol === rolUsuario) {
            return true
        } else {
            sessionStorage.removeItem('session_token');
            window.location.reload();
            return false
        }

    } catch (error) {
        console.error("Error al verificar rol del Usuario:", error);
        sessionStorage.removeItem('session_token');
        window.location.reload();
        return false
    }
}