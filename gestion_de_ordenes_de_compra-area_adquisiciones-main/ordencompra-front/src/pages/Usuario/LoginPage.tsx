import { useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import swal from 'sweetalert';

const Signin: React.FC = () => {

  const [password, setPassword] = useState("");
  const [user, setUser] = useState("");
  const [validacionError, setvalidacionError] = useState({
    mensajeError: '',
  });

  //Funcion login
  const loginSubmit = async (e: any) => {
    //Previene recarga
    e.preventDefault();

    //Se reinicia el mensaje de error
    setvalidacionError({
      ...validacionError,
      mensajeError: ''
    })

    try {
      //Peticion a servidor para obtener token
      const response = await axios.post('/token/', { username: user, password: password })
      // Si la respuesta es exitosa, muestra el modal de éxito
      if (response.status === 200) {
        sessionStorage.setItem('session_token', response.data.access);
        window.location.reload();
      }
    } catch (error: any) {

      if (error.response && error.response.status === 401) {
        setvalidacionError({
          ...validacionError,
          mensajeError: 'Usuario/contraseña incorrecto'
        })

      } else {
        swal('Error con el servidor.', '', 'error');
      }
    }

  };


  return (
    <>
      <section className='h-screen flex items-center justify-center'>
        <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8">
          <form className="space-y-6" onSubmit={loginSubmit}>
            <h5 className="text-xl font-medium text-gray-900 text-center">Inicia sesión</h5>

            <section>
              <label
                htmlFor="user"
                className="block mb-2 text-sm font-medium text-gray-900">
                Nombre Usuario:
              </label>
              <input
                type="text"
                name="user"
                id="user"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Ej: jcdelacruz"
                onChange={(event) => setUser(event.target.value)}
                required />
            </section>

            <section>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900">
                Contraseña:
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                onChange={(event) => setPassword(event.target.value)}
                required />
              {validacionError.mensajeError && <p className="text-red-500 text-sm">{validacionError.mensajeError}</p>}

            </section>

            <div className="flex items-start ml-auto">
              <Link to="/" className="text-sm text-blue-700 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full text-white bg-gray-500 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center">
              Iniciar sesión
            </button>

            <div className="text-sm font-medium text-gray-500">
              ¿No tienes una cuenta?&nbsp;

              <Link to="/solicitar_cuenta" className="text-blue-700 hover:underline">
                Solicítala aquí
              </Link>
            </div>
          </form>
        </div>
      </section>

    </>
  )
}

export default Signin;