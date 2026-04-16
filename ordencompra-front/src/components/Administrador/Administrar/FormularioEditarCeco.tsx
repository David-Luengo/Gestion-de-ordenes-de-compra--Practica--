import React, { useEffect, useState } from "react";
import swal from "sweetalert";
import { validarText } from "@funcionesTS/validaciones";
import InputField from "@components/shared/InputField";
import HttpClient from "@helpers/provider";
import { useVerificarAutenticacion } from "@hooks/useVerificarAutenticacion";

interface FormularioEditarUsuariosModalProps {
  ceco: number;
}

export default function FormularioEditarCeco({
  ceco,
}: FormularioEditarUsuariosModalProps) {
  const esAutenticacionValida = useVerificarAutenticacion("Administrador");
  const [loading, setLoading] = useState(true);

  let initialFormData = {
    id_ceco: "",
    nombre_ceco: "",
    presupuesto_original: 0,
    presupuesto_disponible: 0,
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (ceco !== 0 && esAutenticacionValida) {
      try {
        HttpClient.get("cecos/" + ceco).then((response: any) => {
          setFormData({
            id_ceco: response.data.id_ceco,
            nombre_ceco: response.data.nombre_ceco,
            presupuesto_original: response.data.presupuesto_original,
            presupuesto_disponible: response.data.presupuesto_disponible,
          });
          setLoading(false);
        });
      } catch (error) {}
    }
  }, [esAutenticacionValida, ceco]);

  // Variables iniciales para el formulario y errores de validación
  const initialValidacionError = {
    id_ceco: "",
    nombre_ceco: "",
    presupuesto_original: "",
    presupuesto_disponible: "",
  };

  // Estados para formulario, validacion de errores y area

  const [validacionError, setValidacionError] = useState(
    initialValidacionError
  );

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
      const cecoData = { ...formData };
      // Realizar una solicitud POST a la URL del servidor
      const response = await HttpClient.patch("/cecos/editar_ceco/", cecoData);

      // Si la respuesta es exitosa, muestra swal de exito y recarga la pagina
      if (response.status === 200) {
        swal(
          "Centro de costo Editado",
          "El centro de costos se ha Editado correctamente.",
          "success"
        ).then(() => {
          window.location.reload(); // Recargar la página después de cerrar la alerta
        });
      }
    } catch (error: any) {
      // Manejo de errores
      if (error.data.error) {
        console.error("Error al editar el centro de costos:", error.data.error);
        swal("Error", error.data.error, "error");
      } else if (error.status === 500) {
        swal(
          "Lo sentimos",
          "Se produjo un error interno en el servidor.",
          "error"
        );
      } else {
        console.error("Hubo un error al editar el centro de costos.");
        swal("Error", "Hubo un error al editar el centro de costos.", "error");
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
            <h2 className="text-2xl font-semibold mb-4">
              Editar Centro de costos
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="rut"
                  className="block text-gray-700 font-medium"
                >
                  ID centro de costos
                </label>
                <input
                  type="text"
                  id="id_ceco"
                  className="w-full mt-1 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                  name="id_ceco"
                  value={formData.id_ceco}
                  disabled={true}
                />
              </div>

              <InputField
                label="Nombre de centro de costos"
                type="text"
                name="nombre_ceco"
                value={formData.nombre_ceco}
                onChange={handleInputChange}
                placeholder="ej: iVaras"
                validationFunction={validarText}
                errorMessage="El nombre no puede poseer caracteres especiales."
                setFieldError={handleFieldError}
              />

              <InputField
                label="Presupuesto original"
                type="number"
                name="presupuesto_original"
                value={formData.presupuesto_original}
                onChange={handleInputChange}
                placeholder="ej: 1234"
                errorMessage="El correo ingresado no es válido, el formato es ejemplo@ejemplo.com."
                setFieldError={handleFieldError}
              />

              <div className="mb-4">
                <label
                  htmlFor="rut"
                  className="block text-gray-700 font-medium"
                >
                  Presupuesto disponible
                </label>
                <input
                  type="number"
                  id="presupuesto_original"
                  className="w-full mt-1 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                  name="presupuesto_original"
                  value={formData.presupuesto_disponible}
                />
              </div>

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
