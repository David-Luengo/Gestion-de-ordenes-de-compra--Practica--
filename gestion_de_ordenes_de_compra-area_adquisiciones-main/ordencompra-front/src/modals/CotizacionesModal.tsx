import { useEffect, useState } from "react";
import Modal from "react-modal";
import { CotizacionesDeUsuario, Proveedor } from "@interfaces/interfaces";
import HttpClient from "@helpers/provider";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import ArchivosModal from "@modals/ArchivosModal";

Modal.setAppElement("#root");

interface CotizacionesModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  idSolicitud: number;
  verArchivo: (url: string) => void;
}

interface ModalState {
  cotizacionesModal: boolean;
  trackerModal: boolean;
  archivoModal: boolean;
}

export default function CotizacionesModal({
  isOpen,
  onRequestClose,
  idSolicitud,
  verArchivo,
}: CotizacionesModalProps) {
  const [cotizacionesData, setCotizacionesData] = useState<
    CotizacionesDeUsuario[]
  >([]);
  const [proveedoresData, setProveedoresData] = useState<Proveedor[]>([]);

  const [modalIsOpen, setModalIsOpen] = useState<ModalState>({
    cotizacionesModal: false,
    trackerModal: false,
    archivoModal: false,
  });

  const [abrirArchivo, setAbrirArchivo] = useState<string>("");

  // useEffect para cargar cotizaciones
  useEffect(() => {
    async function cargarCotizaciones() {
      try {
        if (idSolicitud !== 0) {
          const CotizacionesResponse = await HttpClient.get(
            "cotizaciones/cotizaciones_por_solicitud/?id_solicitud=" +
            idSolicitud
          );
          const data: CotizacionesDeUsuario[] = CotizacionesResponse.data;
          setCotizacionesData(data);
        }
      } catch (error) {
        console.error("Error al obtener cotizaciones:", error);
      }
    }
    cargarCotizaciones();
  }, [idSolicitud]);

  // Traer los proveedores
  // Comparar el rut y traer la razón social del proveedor

  useEffect(() => {
    async function cargarProveedores() {
      try {
        const proveedoresResponse = await HttpClient.get("proveedores");
        const data: Proveedor[] = proveedoresResponse.data;
        setProveedoresData(data);
      } catch (error) {
        console.error(error);
      }
    }
    cargarProveedores();
  }, [cotizacionesData]);

  function handleArchivoModal(fileUrl: string) {
    setAbrirArchivo(fileUrl);
    setModalIsOpen((prevState) => ({
      ...prevState,
      archivoModal: true,
    }));
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Cotizaciones Modal"
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

      <div className="text-center mt-5">
        <h2 className="text-center text-4xl font-bold">COTIZACIONES</h2>
      </div>

      <table className="table mt-10">
        <thead>
          <tr>
            <th scope="col">ID SOLICITUD</th>
            <th scope="col">ID COTIZACION</th>
            <th scope="col">RAZÓN SOCIAL</th>
            <th scope="col">NOMBRE CONTACTO PROVEEDOR</th>
            <th scope="col">TELEFONO CONTACTO PROVEEDOR</th>
            <th scope="col">CORREO CONTACTO PROVEEDOR</th>
            <th scope="col">SELECCIONADO</th>
            <th scope="col">COTIZACION ARCHIVO</th>
          </tr>
        </thead>
        <tbody>
          {cotizacionesData.map((cotizaciones: CotizacionesDeUsuario) => (
            <tr key={cotizaciones.id_cotizacion}>
              <td>{cotizaciones.id_solicitud}</td>
              <td>{cotizaciones.id_cotizacion}</td>
              <td>
                {proveedoresData
                  .filter((proveedor: Proveedor) => {
                    const matchProveedor =
                      cotizaciones.rut_proveedor === proveedor.rut_proveedor;
                    return matchProveedor;
                  })
                  .map((proveedor: Proveedor) => proveedor.nombre_proveedor)}
              </td>
              <td>{cotizaciones.nombre_contacto_proveedor}</td>
              <td>{cotizaciones.telefono_contacto_proveedor}</td>
              <td>{cotizaciones.correo_contacto_proveedor}</td>
              <td>
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    readOnly
                    checked={cotizaciones.seleccionado}
                    className="h-7 w-7 pointer-events-none"
                  />
                </div>
              </td>
              <td>
                <div className="flex items-center justify-center">
                  {cotizaciones.cotizaciones_archivo ? (
                    <button
                      type="button"
                      className="rounded-md hover:bg-gray-200 text-gray-400 px-3"
                      onClick={() =>
                        handleArchivoModal(cotizaciones.cotizaciones_archivo)
                      }
                    >
                      <FileOpenIcon />
                    </button>
                  ) : (
                    <span className="text-center">SIN ARCHIVO</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ArchivosModal
        isOpen={modalIsOpen.archivoModal}
        onRequestClose={() => {
          setModalIsOpen((prevState) => ({
            ...prevState,
            archivoModal: false,
          }));
        }}
        abrirArchivo={abrirArchivo}
      />
    </Modal>
  );
}