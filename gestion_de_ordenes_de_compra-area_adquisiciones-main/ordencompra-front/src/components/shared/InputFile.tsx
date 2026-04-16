import React, { ChangeEvent } from 'react';

// Interfaz para las props del componente InputFile.
interface InputFileProps {
  label: string; // Etiqueta del campo de archivo.
  name: string; // Nombre del campo.
  onChange: (e: ChangeEvent<HTMLInputElement>) => void; // Función para manejar cambios en el campo.
  accept: string; // Tipos de archivo aceptados (por ejemplo, ".pdf").
  required?: boolean; // Opción para marcar el campo como obligatorio.
}

const InputFile: React.FC<InputFileProps> = ({
  label,
  name,
  onChange,
  accept,
  required = false,
}) => {
  return (
    <div className={name === 'cotizaciones_archivo' ? "mb-4" : "md:flex md:items-center mb-6"}>
      <div className={name === 'cuadro_comparativo_archivo' || name === "soc_archivo" ? "md:w-1/3" : "md:w-2/3"}>
        <label htmlFor={name} className="mr-4 block text-gray-700 font-medium whitespace-no-wrap">
          {label}
        </label>
      </div>
      <div className={name === 'cotizaciones_archivo' ? "w-full" : "md:w-2/3"}>
        <input
          type="file"
          id={name}
          className="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] font-normal leading-[2.15] text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none"
          name={name}
          accept={accept}
          onChange={onChange}
          required={required}
        />
      </div>
    </div>
  );
};

export default InputFile;
