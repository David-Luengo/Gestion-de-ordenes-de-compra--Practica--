import React, { ChangeEvent, useState } from 'react';

// Interfaz para las opciones del campo de selección.
interface Option {
  value: string | number;
  label: string | number;
}

// Interfaz para las props del componente SelectField.
interface SelectFieldProps {
  label: string; // Etiqueta del campo de selección.
  name: string; // Nombre del campo.
  value: string | number; // Valor seleccionado.
  onChange: (e: ChangeEvent<HTMLSelectElement>, name: string) => void; // Función para manejar cambios en el campo.
  options: Option[]; // Opciones del campo de selección.
  setFieldError?: (fieldName: string, error: string) => void; // Función opcional para establecer errores.
  errorMessage?: string; // Mensaje de error opcional.
  required?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  errorMessage,
  setFieldError,
  required,
}) => {
  // Estado local para almacenar mensajes de error.
  const [error, setError] = useState<string>('');

  // Función para manejar cambios en el campo de selección.
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(e, name);

    if (setFieldError) {
      const isValid = value !== '';
      const errorText = isValid ? '' : errorMessage || 'no válido'; // Mensaje de error predeterminado.
      setError(errorText);
      setFieldError(name, errorText);
    }
  };

  return (
    <div className={name === 'rol' || name === 'area' ? "mt-4 mb-4" : "md:flex md:items-center mb-6"}>
      <div className="md:w-1/3">
        <label htmlFor={name} className="block text-gray-700 font-medium">
          {label}
        </label>
      </div>
      <div className={name === 'rol' || name === 'area' ? "w-full" : "md:w-2/3"}>
        <select
          name={name}
          className={`w-full mt-1 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-2 border-red-300' : 'border border-gray-300'
            }`}
          value={value}
          onChange={handleSelectChange}
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default SelectField;