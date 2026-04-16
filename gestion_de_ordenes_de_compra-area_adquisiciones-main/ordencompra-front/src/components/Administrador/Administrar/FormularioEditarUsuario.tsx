import React, { useEffect, useState } from "react";
import swal from "sweetalert";
import { validarEmail, validarText } from "@funcionesTS/validaciones";
import InputField from "@components/shared/InputField";
import SelectField from "@components/shared/SelectField";
import { Area } from "@interfaces/interfaces";
import HttpClient from "@helpers/provider";
import { useVerificarAutenticacion } from "@hooks/useVerificarAutenticacion";

interface FormularioEditarUsuariosModalProps {
  rut: string;
}

export default function FormularioEditarUsuario({
  rut,
}: FormularioEditarUsuariosModalProps) {
  const esAutenticacionValida = useVerificarAutenticacion("Administrador");
  const [loading, setLoading] = useState(true);

  let initialFormData = {
    rut_usuario: "",
    email: "",
    rol: "",
    nombre: "",
    area: 0,
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (rut !== "" && esAutenticacionValida) {
      try {
        HttpClient.get(
          "usuarios/obtener_datos_usuario_segun_rut/?rut_usuario=" + rut
        ).then((response: any) => {
          setFormData({
            rut_usuario: response.data.rut_usuario,
            email: response.data.email,
            rol: response.data.rol,
            nombre: response.data.nombre,
            area: response.data.area,
          });
          setLoading(false);
        });
      } catch (error) {}
    }
  }, [esAutenticacionValida, rut]);

  // Variables iniciales para el formulario y errores de validación
  const initialValidacionError = {
    email: "",
    nombre: "",
    area: "",
    rol: "",
  };

  // Estados para formulario, validacion de errores y area

  const [validacionError, setValidacionError] = useState(
    initialValidacionError
  );
  const [areas, setAreas] = useState<Area[]>([]);

  // UseEffect para obtener lista de Areas
  useEffect(() => {
    try {
      HttpClient.get("area/").then((response) => {
        setAreas(response.data);
      });
    } catch (error) {}
  }, []);

  // Función para manejar cambios en un campo de entrada del formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "area" && value !== "" ? parseInt(value, 10) : value,
    }));
  };

  // Función para manejo de errores de validación
  const handleFieldError = (name: string, error: string) => {
    setValidacionError((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar si hay errores de validación
    const hasValidationErrors = Object.values(validacionError).some(
      (error) => error !== ""
    );

    if (hasValidationErrors) {
      swal("Error", "Verifique los campos", "error");
      return;
    }

    try {
      // Datos del usuario a enviar al servidor
      const usuarioData = { ...formData };
      // Realizar una solicitud POST a la URL del servidor
      const response = await HttpClient.patch(
        "/usuarios/editar_usuario/",
        usuarioData
      );

      // Si la respuesta es exitosa, muestra swal de exito y recarga la pagina
      if (response.status === 200) {
        swal(
          "Usuario Editado",
          "El usuario se ha Editado correctamente.",
          "success"
        ).then(() => {
          window.location.reload(); // Recargar la página después de cerrar la alerta
        });
      }
    } catch (error: any) {
      // Manejo de errores
      if (error.data.error) {
        console.error("Error al editar el usuario:", error.data.error);
        swal("Error", error.data.error, "error");
      } else if (error.status === 500) {
        swal(
          "Lo sentimos",
          "Se produjo un error interno en el servidor.",
          "error"
        );
      } else {
        swal("Error", "Hubo un error al Editar el usuario.", "error");
      }
    }
  };

  return (
    <>
      {loading ? (
        <div className="w-full h-full flex items-center justify-center border rounded-md">
          {" "}
          Cargando datos...
        </div>
      ) : (
        <div className="flex">
          <div className="max-w-md flex-grow mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4">Editar Usuario</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="rut"
                  className="block text-gray-700 font-medium"
                >
                  RUT Usuario
                </label>
                <input
                  type="text"
                  id="rut_usuario"
                  className="w-full mt-1 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                  name="rut_usuario"
                  value={formData.rut_usuario}
                  disabled={true}
                />
              </div>

              <InputField
                label="Nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="ej: eduardo lopez"
                validationFunction={validarText}
                errorMessage="El nombre no puede poseer caracteres especiales."
                setFieldError={handleFieldError}
              />

              <InputField
                label="Correo Electrónico"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ej: edu.lopez@duocuc.cl"
                validationFunction={validarEmail}
                errorMessage="El correo ingresado no es válido, el formato es ejemplo@ejemplo.com."
                setFieldError={handleFieldError}
              />

              <SelectField
                label="Rol:"
                name="rol"
                value={formData.rol}
                onChange={handleInputChange}
                options={[
                  { value: "", label: "-----------" },
                  { value: "Solicitante", label: "Solicitante" },
                  { value: "Operador", label: "Operador" },
                  { value: "Administrador", label: "Administrador" },
                ]}
                errorMessage="Seleccione un rol"
                setFieldError={handleFieldError}
              />

              <SelectField
                label="Área:"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                options={[
                  { value: "", label: "-----------" },
                  ...areas.map((area) => ({
                    value: area.id_area,
                    label: area.nombre_area,
                  })),
                ]}
                errorMessage="Seleccione un área"
                setFieldError={handleFieldError}
              />
              <button
                type="submit"
                className="w-full bg-gray-500 text-white rounded-md py-2 hover:bg-gray-700 focus:ring-gray-400 focus:ring-2 focus:outline-none"
              >
                Editar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
