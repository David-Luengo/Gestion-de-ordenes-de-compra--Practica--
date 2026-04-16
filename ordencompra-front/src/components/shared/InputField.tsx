import React, { useState, ChangeEvent } from 'react';

// Interfaz para las props del componente InputField.
interface InputFieldProps {
  label: string;                      // Etiqueta del campo de entrada
  type: string;                       // Tipo del campo de entrada
  name: string;                       // Nombre del campo de entrada
  value: string | number;                      // Valor actual del campo de entrada
  onChange: (e: ChangeEvent<HTMLInputElement>, name: string) => void;  // Función para manejar cambios en el campo
  placeholder?: string;               // Texto de marcador de posición opcional
  validationFunction?: (value: string) => boolean;  // Función de validación personalizada
  errorMessage?: string;              // Mensaje de error personalizado
  setFieldError: (fieldName: string, error: string) => void;  // Función para establecer errores en el campo
  required?:boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  validationFunction,
  errorMessage,
  setFieldError,
  required=true
}) => {
  const [error, setError] = useState<string>('');  // Estado local para almacenar mensajes de error

  // Función para manejar cambios en el campo de entrada
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(e, name);  // Llama a la función de cambio pasada como prop y proporciona valor y nombre

    if (validationFunction) {
      const isValid = validationFunction(newValue);
      const errorText = isValid ? '' : errorMessage || 'No válido';
      setError(errorText);
      setFieldError(name, errorText);  // Llama a la función para establecer el error del campo
    }
  };

  // Clases CSS dinámicas basadas en la presencia de errores
  const inputClasses = `w-full mt-1 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
    error ? 'border-2 border-red-300' : 'border border-gray-300'
  }`;

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-gray-700 font-medium">
        {label}:
      </label>
      <input
        type={type}
        id={name}
        className={inputClasses}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        required={required}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}  {/* Muestra el mensaje de error si hay uno */}
    </div>
  );
};

export default InputField;