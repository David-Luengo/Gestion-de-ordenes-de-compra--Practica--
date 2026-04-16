import { useState, useEffect } from 'react';
import { verificarRolAutentico } from '@funcionesTS/obtenerIdUsuario';

export function useVerificarAutenticacion(rol:string) {
  const [autenticacionValida, setAutenticacionValida] = useState<boolean | null>(null);

  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        await verificarRolAutentico(rol);
        setAutenticacionValida(true);
      } catch (error) {
        setAutenticacionValida(false);
      }
    };

    verificarAutenticacion();
  }, [rol]);

  return autenticacionValida;
}
