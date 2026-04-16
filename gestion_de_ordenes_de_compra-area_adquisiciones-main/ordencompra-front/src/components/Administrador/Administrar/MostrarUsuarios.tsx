import { useEffect, useState } from "react";
import { obtenerIdUsuario } from "@funcionesTS/obtenerIdUsuario";
import HttpClient from "@helpers/provider";
import { useVerificarAutenticacion } from "@hooks/useVerificarAutenticacion";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import RateReviewIcon from "@mui/icons-material/RateReview";
import DeleteIcon from "@mui/icons-material/Delete";
import AdministradorFormularioUsuarios from "@modals/AdministradorFormularioUsuarios";
import AdministradorEditarUsuarios from "@modals/AdministradorEditarUsuarios";

export default function MostrarUsuarios() {
  const esAutenticacionValida = useVerificarAutenticacion("Administrador");
  const [usuariosData, setUsuariosData] = useState<[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openModalEditar, setOpenModalEditar] = useState<boolean>(false);
  const [editarRut, setEditarRut] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const pleaseWait = <b>Por favor espere mientras carga ... </b>;

  // useEffect que obtiene lista de usuarios
  useEffect(() => {
    if (!esAutenticacionValida) {
      return;
    }
    if (obtenerIdUsuario() !== 0) {
      try {
        HttpClient.get("usuarios/obtener_datos_usuarios").then(
          (response: any) => {
            setUsuariosData(response.data);
            setLoading(false);
          }
        );
      } catch (error) {}
    }
  }, [esAutenticacionValida]);

  async function handleEditar(rut: string) {
    setEditarRut(rut);
    setOpenModalEditar(true);
  }

  function handleEliminar(row: any): void {
    console.log("eliminar");
  }

  const filterValue = [
    {
      name: "username",
      operator: "contains",
      type: "string",
      value: undefined,
    },
    {
      name: "rut_usuario",
      operator: "contains",
      type: "string",
      value: undefined,
    },
    { name: "rol", operator: "inlist", type: "select", value: "" },
    { name: "nombre", operator: "contains", type: "string", value: undefined },
    { name: "area", operator: "contains", type: "string", value: undefined },
    { name: "email", operator: "contains", type: "string", value: undefined },
  ];

  const columns = [
    {
      name: "username",
      header: "Nombre Usuario",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
      resizable: false,
    },
    {
      name: "rut_usuario",
      header: "RUN",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
      resizable: false,
    },
    {
      name: "rol",
      header: "Rol",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
      resizable: false,
    },
    {
      name: "nombre",
      header: "Nombre",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
      resizable: false,
    },
    {
      name: "area",
      header: "Area",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
      resizable: false,
    },
    {
      name: "email",
      header: "Correo",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
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
          <button onClick={() => handleEditar(data.rut_usuario)}>
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
          <span className="text-center text-3xl py-2">
            Añadir nuevo usuario
          </span>
        </div>

        <h2 className="text-center mb-3 font-bold text-2xl bg-gray-200 p-4 rounded-md shadow-md">
          Listado Usuarios
        </h2>

        <ReactDataGrid
          idProperty="rut_username"
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

      <AdministradorFormularioUsuarios
        isOpen={openModal}
        onRequestClose={() => {
          setOpenModal(false);
        }}
      />

      <AdministradorEditarUsuarios
        isOpen={openModalEditar}
        onRequestClose={() => {
          setOpenModalEditar(false);
        }}
        rut={editarRut}
      />
    </>
  );
}
