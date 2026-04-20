import React, { useEffect, useState } from 'react';
import swal from 'sweetalert';
import { validarRUT, validarUsername, validarEmail, validarPassword, validarText } from '@funcionesTS/validaciones';
import InputField from '@components/shared/InputField';
import SelectField from '@components/shared/SelectField';
import { Area } from '@interfaces/interfaces';
import HttpClient from '@helpers/provider';

export default function FormularioRegistroUsuario() {

    // Variables iniciales para el formulario y errores de validación
    const initialFormData = {
        id : 0,
        username: '',
        rut_usuario: '',
        email: '',
        rol: '',
        nombre: '',
        area: 0,
        password: '',
    };

    const initialValidacionError = {
        id : '',
        username: '',
        rut_usuario: '',
        email: '',
        nombre: '',
        password: '',
        area: '',
        rol: '',
    };
    // Estados para formulario, validacion de errores y area
    const [formData, setFormData] = useState(initialFormData);
    const [validacionError, setValidacionError] = useState(initialValidacionError);
    const [areas, setAreas] = useState<Area[]>([]);

    // UseEffect para obtener lista de Areas
    useEffect(() => {
        try {
            HttpClient.get("area/").then((response) => {
                setAreas(response.data);
            });
        } catch (error) { }
    }, []);

    // Función para manejar cambios en un campo de entrada del formulario
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === 'area' && value !== '' ? parseInt(value, 10) : value,
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
        const hasValidationErrors = Object.values(validacionError).some(error => error !== '');

        if (hasValidationErrors) {
            swal('Error', 'Verifique los campos', 'error');
            return;
        }

        try {
            // Datos del usuario a enviar al servidor
            const usuarioData = { ...formData };
            // Realizar una solicitud POST a la URL del servidor
            const response = await HttpClient.post('/usuarios/crear_usuario/', usuarioData);

            // Si la respuesta es exitosa, muestra swal de exito y redirecciona a login
            if (response.status === 201) {
                swal('Usuario Creado', 'El usuario se ha creado correctamente.', 'success').then(() => {
                    window.location.reload();  // Recargar la página después de cerrar la alerta
                  });

            }

        } catch (error: any) {
            // Manejo de errores
            if (error.data.error) {
                console.error('Error al registrar el usuario:', error.data.error);
                swal('Error', error.data.error, 'error');
            } else
                if (error.status === 500) {
                    swal('Lo sentimos', 'Se produjo un error interno en el servidor.', 'error');
                }
                else {
                    console.error('Hubo un error al registrar el usuario.');
                    swal('Error', 'Hubo un error al registrar el usuario.', 'error');
                }
        }
    };

    return (
        <>
            <div className="flex">

                <div className="max-w-md flex-grow mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl border border-gray-200">

                    <h2 className="text-2xl font-semibold mb-4">Registro de Usuarios</h2>

                    <form onSubmit={handleSubmit}>

                        <InputField
                            label="Nombre de Usuario"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="ej: edulopez"
                            validationFunction={validarUsername}
                            errorMessage="Debe tener entre 5 y 15 caracteres y solo puede contener números, letras, (.), (-) y (_)"
                            setFieldError={handleFieldError}
                        />

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
                            label="Rol:"
                            name="rol"
                            value={formData.rol}
                            onChange={handleInputChange}
                            options={[
                                { value: '', label: '-----------' },
                                { value: 'Solicitante', label: 'Solicitante' },
                                { value: 'Operador', label: 'Operador' },
                                { value: 'Administrador', label: 'Administrador' },
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
                                { value: '', label: '-----------' },
                                ...areas.map((area) => ({
                                    value: area.id_area,
                                    label: area.nombre_area,
                                })),
                            ]}
                            errorMessage="Seleccione un área"
                            setFieldError={handleFieldError}
                        />

                        <InputField
                            label="Contraseña"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            validationFunction={validarPassword}
                            errorMessage="La contraseña debe contener al menos 5 caracteres."
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
