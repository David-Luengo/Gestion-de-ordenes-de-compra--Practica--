import { useEffect, useState } from "react";
import { obtenerIdUsuario } from "@funcionesTS/obtenerIdUsuario";
import HttpClient from "@helpers/provider";
import { useVerificarAutenticacion } from "@hooks/useVerificarAutenticacion";
import NumberFilter from "@inovua/reactdatagrid-community/NumberFilter";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import RateReviewIcon from "@mui/icons-material/RateReview";
import DeleteIcon from "@mui/icons-material/Delete";
import AdministradorFormularioArea from "@modals/AdministradorFormularioArea";
import AdministradorEditarArea from "@modals/AdministradorEditarArea";

export default function MostrarAreas() {
  const esAutenticacionValida = useVerificarAutenticacion("Administrador");
  const [usuariosData, setUsuariosData] = useState<[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openModalArea, setOpenModalArea] = useState<boolean>(false);
  const [editarArea, setEditarArea] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const pleaseWait = <b>Por favor espere mientras carga ... </b>;

  // useEffect que obtiene lista de proveedores
  useEffect(() => {
    if (!esAutenticacionValida) {
      return;
    }
    if (obtenerIdUsuario() !== 0) {
      try {
        HttpClient.get("/area/").then((response: any) => {
          setUsuariosData(response.data);
          setLoading(false);
        });
      } catch (error) {}
    }
  }, [esAutenticacionValida]);

  function handleEditar(area: number): void {
    setEditarArea(area);
    setOpenModalArea(true);
  }

  function handleEliminar(row: any): void {
    console.log("eliminar");
  }

  const filterValue = [
    { name: "id_area", operator: "eq", type: "number", value: undefined },
    {
      name: "nombre_area",
      operator: "contains",
      type: "string",
      value: undefined,
    },
    { name: "id_ceco", operator: "eq", type: "number", value: undefined },
  ];

  const columns = [
    {
      name: "id_area",
      header: "ID_Area",
      minWidth: 10,
      defaultFlex: 1,
      type: "number",
      filter: "number",
      filterEditor: NumberFilter,
      resizable: false,
    },
    {
      name: "nombre_area",
      header: "Nombre Area",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
      resizable: false,
    },
    {
      name: "id_ceco",
      header: "ID_CECO",
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
          <button onClick={() => handleEditar(data.id_area)}>
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
      resizable: false,
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
          <span className="text-center text-3xl py-2">Añadir nueva área</span>
        </div>

        <h2 className="text-center mb-5 font-bold text-2xl bg-gray-200 p-4 rounded-md shadow-md">
          Listado Area
        </h2>
        <ReactDataGrid
          idProperty="id_area"
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
      <AdministradorFormularioArea
        isOpen={openModal}
        onRequestClose={() => {
          setOpenModal(false);
        }}
      />
      <AdministradorEditarArea
        isOpen={openModalArea}
        onRequestClose={() => {
          setOpenModalArea(false);
        }}
        area={editarArea}
      />
    </>
  );
}
