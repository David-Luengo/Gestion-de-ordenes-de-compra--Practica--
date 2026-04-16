import React, { ChangeEvent } from "react";

// Interfaz para las props del componente TextareaField.
interface TextareaFieldProps {
  label: string; // Etiqueta del campo de texto.
  name: string; // Nombre del campo.
  value: string; // Valor del campo de texto.
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; // Función para manejar cambios en el campo.
  required?: boolean; // Opción para marcar el campo como obligatorio.
  rows?: number; // Número de filas del campo de texto.
  cols?: number; // Número de columnas del campo de texto.
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  required = false,
  rows = 5,
  cols = 80,
}) => {
  return (
    <div className="form-group row">
      <label
        htmlFor={name}
        className="form-label block text-gray-700 font-medium text-xl"
      >
        {label}
      </label>
      <textarea
        className="w-full p-2 border border-gray-300 rounded-md resize-none"
        // style={{
        //   resize: "none",
        //   border: "2px solid black",
        //   marginLeft: 12,
        // }}
        id={name}
        cols={cols}
        rows={rows}
        name={name}
        onChange={onChange}
        value={value}
        required={required}
      />
    </div>
  );
};

export default TextareaField;
