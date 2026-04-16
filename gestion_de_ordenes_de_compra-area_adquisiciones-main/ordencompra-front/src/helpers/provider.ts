/* eslint-disable quote-props */
import axios from 'axios';
import swal from "sweetalert";

const HttpClient = axios.create();

HttpClient.interceptors.request.use(
  (config) => {
    const extendedHeaders = ProvidersHelper.getRequestHeaders();
    // const extendedHeaders = config.url?.includes(API_LOCAL_URL) ?
    //   ProvidersHelper.getRequestHeaders() :
    //   ProvidersHelper.getDefaultRequestHeaders();
    config.headers = {
      ...extendedHeaders as any,
      ...config.headers,
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

HttpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // La solicitud se completó con un código de respuesta diferente de 2xx
      //console.error('Error en la respuesta:', error.response.status, error.response.data);

      if (error.response.status === 500) {
        // Mensaje de error personalizado para el error 500
        swal('Lo sentimos', 'Se produjo un error interno en el servidor.', 'error');
      }

      // Retornar una promesa rechazada con la respuesta del servidor
      return Promise.reject(error.response);
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta (puede ser un problema de red)
      // console.error('Error en la solicitud:', error.request);

      // Retornar una promesa rechazada con el error de solicitud
      return Promise.reject(error.request);
    } else {
      // Algo sucedió en la configuración de la solicitud que causó un error
      // console.error('Error en la configuración de la solicitud:', error.message);

      // Mostrar un mensaje de error al usuario
      // swal('Error', 'Hubo un error en la configuración de la solicitud.', 'error');

      // Retornar una promesa rechazada con el error de configuración
      return Promise.reject(error);
    }
  }
);

export default HttpClient;

export class ProvidersHelper {
  private static _baseHeaders = {
    'Content-Type': 'multipart/form-data',
    Accept: 'application/json',
  };

  public static getRequestHeaders() {
    return {
      ...ProvidersHelper._baseHeaders,
      Authorization: `${'Bearer '+sessionStorage.getItem('session_token')}`,
      Lang: 'en-US',
    //   Environment: process.env.NODE_ENV,
    };
  };

  public static getDefaultRequestHeaders(): (typeof ProvidersHelper._baseHeaders) {
    return ProvidersHelper._baseHeaders;
  };
}
