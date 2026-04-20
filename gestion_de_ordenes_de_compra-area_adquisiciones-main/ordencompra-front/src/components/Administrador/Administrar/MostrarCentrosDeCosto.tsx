import { useEffect, useState } from "react";
import { obtenerIdUsuario } from "@funcionesTS/obtenerIdUsuario";
import HttpClient from "@helpers/provider";
import { useVerificarAutenticacion } from "@hooks/useVerificarAutenticacion";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import NumberFilter from "@inovua/reactdatagrid-community/NumberFilter";
import RateReviewIcon from "@mui/icons-material/RateReview";
import DeleteIcon from "@mui/icons-material/Delete";

import AdministradorEditarCeco from "@modals/AdministradorEditarCeco";
import AdministradorFormularioCeco from "@modals/AdministradorFormularioCeco";

export default function MostrarCentrosDeCosto() {
  const esAutenticacionValida = useVerificarAutenticacion("Administrador");
  const [usuariosData, setUsuariosData] = useState<[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openModalCeco, setOpenModalCeco] = useState<boolean>(false);
  const [editarCeco, setEditarCeco] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const pleaseWait = <b>Por favor espere mientras carga ... </b>;

  // useEffect
  useEffect(() => {
    if (!esAutenticacionValida) {
      return;
    }
    if (obtenerIdUsuario() !== 0) {
      try {
        HttpClient.get("/cecos/").then((response: any) => {
          setUsuariosData(response.data);
          setLoading(false);
        });
      } catch (error) {}
    }
  }, [esAutenticacionValida]);

  async function handleEditar(ceco: number) {
    setEditarCeco(ceco);
    setOpenModalCeco(true);
  }

  function handleEliminar(row: any): void {
    console.log("eliminar");
  }

  const filterValue = [
    { name: "id_ceco", operator: "eq", type: "number", value: undefined },
    {
      name: "nombre_ceco",
      operator: "contains",
      type: "string",
      value: undefined,
    },
    {
      name: "presupuesto_original",
      operator: "eq",
      type: "number",
      value: undefined,
    },
    {
      name: "presupuesto_disponible",
      operator: "eq",
      type: "number",
      value: undefined,
    },
  ];

  const columns = [
    {
      name: "id_ceco",
      header: "ID_Ceco",
      minWidth: 10,
      defaultFlex: 1,
      type: "number",
      filter: "number",
      filterEditor: NumberFilter,
      resizable: false,
    },
    {
      name: "nombre_ceco",
      header: "Nombre Ceco",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
      resizable: false,
    },
    {
      name: "presupuesto_original",
      header: "Presupuesto Original",
      minWidth: 10,
      defaultFlex: 1,
      type: "number",
      filter: "number",
      filterEditor: NumberFilter,
      resizable: false,
    },
    {
      name: "presupuesto_disponible",
      header: "Presupuesto Disponible",
      minWidth: 10,
      defaultFlex: 1,
      type: "number",
      filter: "number",
      filterEditor: NumberFilter,
      resizable: false,
    },
    {
      header: "Editar",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: false,
      render: ({ data }: any) => (
        <div className="flex items-center justify-center">
          <button onClick={() => handleEditar(data.id_ceco)}>
            <RateReviewIcon />
          </button>
        </div>
      ),
      resizable: false,
    },
    {
      header: "Eliminar",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: false,
      render: (value: any, row: any) => (
        <div className="flex items-center justify-center">
          <button onClick={() => handleEliminar(row)}>
            <DeleteIcon />
          </button>
        </div>
      ),
    },
  ];

  const gridStyle = { minHeight: 550 };

  const dataSource = usuariosData.map((usuariosData: any) => {
    return {
      ...usuariosData,
    };
  });

  return (
    <>
      <div className="bg-white p-2 rounded-md mt-3">
        <div
          onClick={() => setOpenModal(true)}
          className="flex justify-center items-center w-full border shadow-md rounded-md hover:bg-gray-200 hover:cursor-pointer mb-3"
        >
          <span className="text-center text-3xl py-2">
            Añadir nuevo Centro de Costo
          </span>
        </div>

        <h2 className="text-center mb-5 font-bold text-2xl bg-gray-200 p-4 rounded-md shadow-md">
          Listado Centro de Costos
        </h2>

        <ReactDataGrid
          idProperty="id_ceco"
          columns={columns}
          dataSource={dataSource}
          style={gridStyle}
          defaultFilterValue={filterValue}
          enableColumnFilterContextMenu={false}
          loading={loading}
          loadingText={pleaseWait}
          showColumnMenuTool={false}
        />
      </div>

      <AdministradorFormularioCeco
        isOpen={openModal}
        onRequestClose={() => {
          setOpenModal(false);
        }}
      />

      <AdministradorEditarCeco
        isOpen={openModalCeco}
        onRequestClose={() => {
          setOpenModalCeco(false);
        }}
        ceco={editarCeco}
      />
    </>
  );
}
