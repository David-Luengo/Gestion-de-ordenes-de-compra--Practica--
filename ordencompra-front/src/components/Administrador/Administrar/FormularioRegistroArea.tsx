import React, { useState, useEffect } from "react";
import swal from "sweetalert";
import {
  validarText,
} from "@funcionesTS/validaciones";
import InputField from "@components/shared/InputField";
import HttpClient from "@helpers/provider";
import SearchableSelect from "@components/shared/SearchableSelect";

export default function FormularioRegistroArea() {
  // Variables iniciales para el formulario y errores de validación
  const initialFormData = {
    nombre_area: "",
    id_ceco: "",
  };

  const initialValidacionError = {
    nombre_area: "",
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
      const areaData = { ...formData };
      // Realizar una solicitud POST a la URL del servidor
      const response = await HttpClient.post("/area/", areaData);

      // Si la respuesta es exitosa, muestra swal de exito y redirecciona a login
      if (response.status === 201) {
        swal(
          "Área Creada",
          "El área se ha creado correctamente.",
          "success"
        ).then(() => {
          window.location.reload(); // Recargar la página después de cerrar la alerta
        });
      }
    } catch (error: any) {
      // Manejo de errores
      if (error.data.error) {
        console.error("Error al registrar el área:", error.data.error);
        swal("Error", error.data.error, "error");
      } else if (error.status === 500) {
        swal(
          "Lo sentimos",
          "Se produjo un error interno en el servidor.",
          "error"
        );
      } else {
        console.error("Hubo un error al registrar el área.");
        swal("Error", "Hubo un error al registrar el área.", "error");
      }
    }
  };

  const [cecos, setCecos] = useState([]);
  useEffect(() => {
    try {
      HttpClient.get("/cecos/").then((response) => {
        setCecos(response.data);
      });
    } catch (error) {
      console.error("Error al obtener las areas:", error);
    }
  }, []);

  return (
    <>
      <div className="flex">
        <div className="max-w-md flex-grow mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Registro de Area</h2>

          <form onSubmit={handleSubmit}>
            <InputField
              label="Nombre Area"
              type="text"
              name="nombre_area"
              value={formData.nombre_area}
              onChange={handleInputChange}
              placeholder="ej: edulopez"
              validationFunction={validarText}
              errorMessage="El nombre no puede poseer caracteres especiales."
              setFieldError={handleFieldError}
            />

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-900">
                ID Ceco:
              </label>
              <SearchableSelect
                options={cecos.map((ceco: any) => ({
                  label: ceco.nombre_ceco,
                  value: ceco.id_ceco,
                }))}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setFormData((prevForm) => ({
                      ...prevForm,
                      id_ceco: selectedOption.value, // Update rut_proveedor
                    }));
                  }
                }}
                name="id_ceco"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="rut" className="block text-gray-700 font-medium">
                ID Centro de costo
              </label>
              <input
                type="text"
                id="id_ceco_id"
                className="w-full mt-1 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                name="id_ceco_id"
                value={formData.id_ceco}
                disabled={true}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-500 text-white rounded-md py-2 hover:bg-gray-700 focus:ring-gray-400 focus:ring-2 focus:outline-none"
            >
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
