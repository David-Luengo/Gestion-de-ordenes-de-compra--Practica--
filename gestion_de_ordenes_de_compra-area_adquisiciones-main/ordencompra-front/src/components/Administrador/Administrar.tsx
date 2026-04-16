import { useState } from "react";
import MenuAdministrar from "@components/Administrador/Administrar/MenuAdministrar";
import MostrarAreas from "@components/Administrador/Administrar/MostrarAreas";
import MostrarCentrosDeCosto from "@components/Administrador/Administrar/MostrarCentrosDeCosto";
import MostrarUsuarios from "@components/Administrador/Administrar/MostrarUsuarios";

export default function Administrar() {
  const [selectedMenuItem, setSelectedMenuItem] = useState("usuarios");

  return (
    <>
      <div className="container mx-auto bg-white rounded-md p-2">
        <MenuAdministrar
          selectedMenuItem={selectedMenuItem}
          setSelectedMenuItem={setSelectedMenuItem}
        />
        <div className="relative mt-2 table-wrp block max-h-screen overflow-x-auto sm:rounded-lg mx-auto bg-white rounded-md p-2">
              {selectedMenuItem === "usuarios" && <MostrarUsuarios />}
              {selectedMenuItem === "centros" && <MostrarCentrosDeCosto />}
              {selectedMenuItem === "areas" && <MostrarAreas />}
        </div>
      </div>
    </>

  );
}
