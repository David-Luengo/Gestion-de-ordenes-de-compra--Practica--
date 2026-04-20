import { useEffect, useState } from "react";
import Modal from "react-modal";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { useVerificarAutenticacion } from "../hooks/useVerificarAutenticacion";
import { obtenerIdUsuario } from "../funcionesTS/obtenerIdUsuario";
import HttpClient from "../helpers/provider";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import swal from "sweetalert";

Modal.setAppElement("#root");

interface AsignarModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  idSolicitud: number;
}

export default function AsignarModal({
  isOpen,
  onRequestClose,
  idSolicitud,
}: // openRolesModal,
AsignarModalProps) {
  const esAutenticacionValida = useVerificarAutenticacion("Administrador");
  const [operadoresData, setOperadoresData] = useState<[]>([]);

  // useEffect que obtiene lista de operadores
  useEffect(() => {
    if (!esAutenticacionValida) {
      return;
    }
    if (obtenerIdUsuario() !== 0) {
      try {
        HttpClient.get("usuarios/obtener_datos_operadores").then(
          (response: any) => {
            setOperadoresData(response.data);
          }
        );
      } catch (error) {}
    }
  }, [esAutenticacionValida]);

  async function asignar(rut: string) {
    try {
      const datos = {
        id_solicitud: idSolicitud,
        asignado_operador: rut,
      };

      swal({
        title: "¿Desea asignar la solicitud?",
        text: "Verifique que seleccionó correctamente.",
        buttons: ["Cancelar", "Aceptar"], // Muestra los botones por defecto (OK y Cancelar)
      }).then((result) => {
        if (result !== null) {
          HttpClient.patch("solicitudes/asignar_solicitud/", datos);

          HttpClient.post("solicitudes/correo_solicitud_asignada/", datos);

          swal("Solicitud procesada exitosamente.", "", "success").then(() => {
            window.location.reload();
          });
        } else {
          swal("Solicitud no asignada.", "", "info");
        }
      });

      onRequestClose();
    } catch (error) {
      onRequestClose();

      swal("Error en el procesamiento de la solicitud.", "", "error").then(
        () => {
          window.location.reload();
        }
      );
    }
  }

  const filterValue = [
    {
      name: "rut_usuario",
      operator: "contains",
      type: "string",
      value: undefined,
    },
    { name: "nombre", operator: "contains", type: "string", value: undefined },
    { name: "rol", operator: "inlist", type: "select", value: "" },
    { name: "email", operator: "contains", type: "string", value: undefined },
  ];

  const columns = [
    {
      name: "rut_usuario",
      header: "RUN",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
    },
    {
      name: "nombre",
      header: "Nombre",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
    },
    {
      name: "rol",
      header: "Rol",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
    },
    {
      name: "email",
      header: "Correo",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: "string",
    },
    {
      name: "Asignar",
      header: "Asignar",
      minWidth: 10,
      defaultFlex: 1,
      type: "string",
      filter: false,
      render: ({ data }: any) => (
        <button onClick={() => asignar(data.rut_usuario)}>
          <RateReviewIcon />
        </button>
      ),
    },
  ];

  const gridStyle = { minHeight: 550 };

  const dataSource = operadoresData.map((operadoresData: any) => {
    return {
      ...operadoresData,
    };
  });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Asignar Modal"
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
          width: "90%",
          height: "90%",
        },
      }}
    >
      <button
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-10 absolute top-4 right-4"
        onClick={onRequestClose}
      >
        Cerrar
      </button>

      {/* copy */}
      <div className="bg-white p-2 rounded-md mt-3">
        <h2 className="text-center mb-3 font-bold text-2xl bg-gray-200 p-4 rounded-md shadow-md">
          Asignar
        </h2>

        <ReactDataGrid
          idProperty="rut_usuario"
          columns={columns}
          dataSource={dataSource}
          style={gridStyle}
          defaultFilterValue={filterValue}
          enableColumnFilterContextMenu={false}
        />
      </div>
    </Modal>
  );
}
