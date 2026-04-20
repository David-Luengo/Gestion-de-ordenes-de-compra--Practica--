import React, { useEffect, useState } from "react";
import axios from "axios";
import swal from "sweetalert";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import {
  validarRUT,
  validarEmail,
  validarText,
} from "@funcionesTS/validaciones";
import InputField from "@components/shared/InputField";
import SelectField from "@components/shared/SelectField";
import { Area } from "@interfaces/interfaces";

export default function FormularioCuenta() {
  // Constante para navegar
  const navigate = useNavigate();

  // Variables iniciales para el formulario y errores de validación'email': email,

  const initialFormData = {
    rut_usuario: "",
    email: "",
    nombre: "",
    area: 0,
    extrainfo: "",
  };

  const initialValidacionError = {
    rut_usuario: "",
    email: "",
    nombre: "",
    area: 0,
    extrainfo: "",
  };
  // Estados para formulario, validacion de errores y area
  const [formData, setFormData] = useState(initialFormData);
  const [validacionError, setValidacionError] = useState(
    initialValidacionError
  );
  const [areas, setAreas] = useState<Area[]>([]);

  const [loading, setLoading] = useState(false);

  // UseEffect para obtener lista de Areas
  useEffect(() => {
    try {
      axios.get("area/").then((response) => {
        setAreas(response.data);
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Función para manejar cambios en un campo de entrada del formulario
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

    setLoading(true);

    try {
      // Datos del usuario a enviar al servidor
      const usuarioData = { ...formData };
      // Realizar una solicitud POST a la URL del servidor
      const response = await axios.post(
        "usuarios/correo_solicitar_cuenta/",
        usuarioData
      );

      // Si la respuesta es exitosa, muestra swal de exito y redirecciona a login
      if (response.status === 200) {
        swal("Solicitud enviada", "Te contactaremos en breve.", "success");
        navigate("/login");
      }
    } catch (error: any) {
      // Manejo de errores
      if (error.response.data.error) {
        console.error(
          "Error al ingresar una solicitud de cuenta:",
          error.response.data.error
        );
        swal("Error", error.response.data.error, "error");
      } else if (error.response.status === 500) {
        swal(
          "Lo sentimos",
          "Se produjo un error interno en el servidor.",
          "error"
        );
      } else {
        console.error("Hubo un error al enviar la solicitud de cuenta.");
        swal(
          "Error",
          "Hubo un error al enviar la solicitud de cuenta.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex">
        <Link
          to="/login"
          className="md:flex hidden bg-white hover:bg-gray-400 hover:cursor-pointer w-16 h-16 left-5 top-4 mt-10 ml-10 border border-black rounded-full z-50 text-center items-center justify-center"
        >
          <ArrowBackIosNewIcon />
        </Link>

        <div className="max-w-md flex-grow mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">Registro de Usuarios</h2>

          <form onSubmit={handleSubmit}>
            <InputField
              label="RUT Usuario"
              type="text"
              name="rut_usuario"
              value={formData.rut_usuario}
              onChange={handleInputChange}
              placeholder="ej: 20111222-3"
              validationFunction={validarRUT}
              errorMessage="El rut debe tener formato 20111222-3."
              setFieldError={handleFieldError}
            />

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

            <div className="form-group row -mt-5" style={{ padding: 20 }}>
              <label
                htmlFor={"extrainfo"}
                className="form-label block text-gray-700 font-medium"
              >
                Infomación extra (opcional)
              </label>
              <textarea
                className="col-sm-12 border rounded-md"
                id="extrainfo"
                cols={80}
                rows={5}
                name="extrainfo"
                onChange={handleInputChange}
                value={formData.extrainfo}
                placeholder="ej: Hablamos hoy a las..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-500 text-white rounded-md py-2 hover:bg-gray-700 focus:ring-gray-400 focus:ring-2 focus:outline-none"
              disabled={loading}
            >
              {loading ? "Procesando..." : "Solicitar cuenta"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
