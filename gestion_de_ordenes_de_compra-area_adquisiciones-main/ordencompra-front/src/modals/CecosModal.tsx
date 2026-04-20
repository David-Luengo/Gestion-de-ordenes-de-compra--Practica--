import Modal from "react-modal";
import { obtenerIdUsuario } from "@funcionesTS/obtenerIdUsuario";
import { useEffect, useState } from "react";
import HttpClient from "@helpers/provider";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import NumberFilter from "@inovua/reactdatagrid-community/NumberFilter";
import "@inovua/reactdatagrid-community/index.css";

Modal.setAppElement("#root");

interface DescripcionModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  rolUsuario: string;
}

export default function CecosModal({
  isOpen,
  onRequestClose,
  rolUsuario,
}: DescripcionModalProps) {
  const [cecoData, setCecoData] = useState([]);
  useEffect(() => {
    if(!rolUsuario){
        return;
    }
    async function obtenerCeco() {
      try {
        const userId = await obtenerIdUsuario();

        let endpoint = "a";

        switch (rolUsuario) {
          case "Solicitante":
            endpoint = "/cecos/ver_ceco_solicitante/?user_id=" + userId;
            break;
          default:
            endpoint = "/cecos/";
            break;
        }

        const { data } = await HttpClient.get(endpoint);
        setCecoData(data);
      } catch (error) {
        console.error("Error al obtener ceco:", error);
      }

    }
    obtenerCeco();
  }, [rolUsuario]);

  const filterValue = [
    { name: "id_ceco", operator: "eq", type: "number", value: undefined },
    { name: "nombre_ceco", operator: "contains", type: "string", value: "" },
  ];

  const columns = [
    {
      name: "id_ceco",
      header: "ID CECO",
      minWidth: 10,
      defaultFlex: 1,
      type: "number",
      filter: "number",
      filterEditor: NumberFilter,
    },
    {
      name: "nombre_ceco",
      header: "NOMBRE CECO",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
    },
    {
      name: "presupuesto_original",
      header: "PRESUPUESTO ORIGINAL",
      minWidth: 10,
      defaultFlex: 1,
      type: "number",
    },
    {
      name: "presupuesto_disponible",
      header: "PRESUPUESTO DISPONIBLE",
      minWidth: 10,
      defaultFlex: 1,
      type: "number",
    },
  ];

  const gridStyle = { minHeight: 550 };

  const dataSource = cecoData;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Descripción Modal"
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          marginTop: "25px",
        },
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          width: "50%",
          height: "80%",
        },
      }}
    >
      <button
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-10 absolute top-4 right-4"
        onClick={onRequestClose}
      >
        Cerrar
      </button>

      <div className="flex justify-center items-center">
        <div className="text-center w-full">
          <h1 className="text-3xl my-5 font-semibold">Centros de costos</h1>
          <ReactDataGrid
            idProperty="id_ceco"
            columns={columns}
            dataSource={dataSource}
            style={gridStyle}
            defaultFilterValue={filterValue}
            enableColumnFilterContextMenu={false}
          />
        </div>
      </div>
    </Modal>
  );
}
