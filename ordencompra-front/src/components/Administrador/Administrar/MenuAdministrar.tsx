interface MenuAdministrarModalProps {
  selectedMenuItem: string;
  setSelectedMenuItem: React.Dispatch<React.SetStateAction<string>>;
}

export default function MenuAdministrar({
  selectedMenuItem,
  setSelectedMenuItem,
}: MenuAdministrarModalProps) {
  return (
    <div className="flex justify-between gap-10">
      <div
        className={`border shadow-md rounded-md cursor-pointer p-10 w-full text-center ${
          selectedMenuItem === "usuarios" ? "bg-gray-300" : ""
        }`}
        onClick={() => setSelectedMenuItem("usuarios")}
      >
        Usuarios
      </div>
      <div
        className={`border shadow-md rounded-md cursor-pointer p-10 w-full text-center ${
          selectedMenuItem === "centros" ? "bg-gray-300" : ""
        }`}
        onClick={() => setSelectedMenuItem("centros")}
      >
        Centros de costos
      </div>
      <div
        className={`border shadow-md rounded-md cursor-pointer p-10 w-full text-center ${
          selectedMenuItem === "areas" ? "bg-gray-300" : ""
        }`}
        onClick={() => setSelectedMenuItem("areas")}
      >
        Áreas
      </div>
    </div>
  );
}
