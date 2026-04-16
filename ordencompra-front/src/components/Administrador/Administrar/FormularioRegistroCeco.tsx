import React, { useState } from "react";
import swal from "sweetalert";
import {
  validarText,
  validarNumeroEntero,
} from "../../../funcionesTS/validaciones";
import InputField from "../../shared/InputField";
import HttpClient from "../../../helpers/provider";

export default function FormularioRegistroCeco() {
  // Variables iniciales para el formulario y errores de validación
  const initialFormData = {
    id_ceco: "",
    nombre_ceco: "",
    presupuesto_original: "",
    area: 0,
  };

  const initialValidacionError = {
    nombre_ceco: "",
    presupuesto_original: "",
    area: "",
  };
  // Estados para formulario, validacion de errores y area
  const [formData, setFormData] = useState(initialFormData);
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
      const response = await HttpClient.post("/cecos/", cecoData);

      // Si la respuesta es exitosa, muestra swal de exito y redirecciona a login
      if (response.status === 201) {
        swal(
          "Centro de costos Creado",
          "El centro de costos se ha creado correctamente.",
          "success"
        ).then(() => {
          window.location.reload(); // Recargar la página después de cerrar la alerta
        });
      }
    } catch (error: any) {
      // Manejo de errores
      if (error.data.error) {
        console.error("Error al registrar el usuario:", error.data.error);
        swal("Error", error.data.error, "error");
      } else if (error.status === 400) {
        swal("Lo sentimos", "El id ceco ya existe.", "error");
      } else if (error.status === 500) {
        swal(
          "Lo sentimos",
          "Se produjo un error interno en el servidor.",
          "error"
        );
      } else {
        console.error("Hubo un error al registrar el centro de costos.");
        swal(
          "Error",
          "Hubo un error al registrar el centro de costos.",
          "error"
        );
      }
    }
  };

  return (
    <>
      <div className="flex">
        <div className="max-w-md flex-grow mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">
            Registro Centro de Costos
          </h2>

          <form onSubmit={handleSubmit}>
            <InputField
              label="Id Centro de Costos"
              type="text"
              name="id_ceco"
              value={formData.id_ceco}
              onChange={handleInputChange}
              placeholder="ej: 1001"
              validationFunction={validarNumeroEntero}
              errorMessage="El id solo tiene que contener números."
              setFieldError={handleFieldError}
            />

            <InputField
              label="Nombre Centro de Costos"
              type="text"
              name="nombre_ceco"
              value={formData.nombre_ceco}
              onChange={handleInputChange}
              placeholder="ej: edulopez"
              validationFunction={validarText}
              errorMessage="Debe tener entre 5 y 15 caracteres y solo puede contener números, letras, (.), (-) y (_)"
              setFieldError={handleFieldError}
            />

            <InputField
              label="Presupuesto Original"
              type="text"
              name="presupuesto_original"
              value={formData.presupuesto_original}
              onChange={handleInputChange}
              placeholder="ej: $200.000"
              validationFunction={validarNumeroEntero}
              errorMessage="Debe tener entre 5 y 15 caracteres y solo puede contener números, letras, (.), (-) y (_)"
              setFieldError={handleFieldError}
            />

            <button
              type="submit"
              className="w-full bg-gray-500 text-white rounded-md py-2 hover:bg-gray-700 focus:ring-gray-400 focus:ring-2 focus:outline-none"
            >
              Registrar
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
