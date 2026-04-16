import { useEffect, useState } from "react";
import CotizacionesModal from "@modals/CotizacionesModal";
import {
  CotizacionesDeUsuario,
  Proveedor,
  SolicitudDeUsuarioConFecha,
} from "@interfaces/interfaces";
import HttpClient from "@helpers/provider";
import { obtenerIdUsuario } from "@funcionesTS/obtenerIdUsuario";
import Swal from "sweetalert2";
import TrackerModal from "@modals/TrackerModal";
import SearchableSelect from "@components/shared/SearchableSelect";
import Datepicker from "react-tailwindcss-datepicker";

import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import RateReviewIcon from "@mui/icons-material/RateReview";

import ArchivosModal from "@modals/ArchivosModal";
import { useVerificarAutenticacion } from "@hooks/useVerificarAutenticacion";
import ResolverModal from "@modals/ResolverModal";

import DescripcionModal from "@modals/DescripcionModal";
import TitleHeader from "@components/shared/TitleHeader";
import Paginator from "@components/shared/Paginator";

interface ModalState {
  cotizacionesModal: boolean;
  trackerModal: boolean;
  archivoModal: boolean;
  resolverSolicitud: boolean;
  descripcionModal: boolean;
}

function ModalButton({
  // label,
  onClick,
}: {
  // label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="rounded-md hover:bg-gray-200 text-gray-400 py-2 px-3 mb-10 w-full"
      onClick={onClick}
    >
      <DownloadIcon />
    </button>
  );
}

export default function TablaSolicitudes() {
  const [solicitudesData, setSolicitudesData] = useState<
    SolicitudDeUsuarioConFecha[]
  >([]);
  const [modalIsOpen, setModalIsOpen] = useState<ModalState>({
    cotizacionesModal: false,
    trackerModal: false,
    archivoModal: false,
    resolverSolicitud: false,
    descripcionModal: false,
  });
  const [userId, setUserId] = useState<number>(0);
  const [idSolicitud, setIdSolicitud] = useState<number>(0);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [, setCotizacionesPorUsuario] = useState<CotizacionesDeUsuario[]>([]);
  const [filtroRutProveedor, setFiltroRutProveedor] = useState<string>("");

  interface DateState {
    startDate: Date | null;
    endDate: Date | null;
  }

  const [filtroFecha, setFiltroFecha] = useState<DateState>({
    startDate: null,
    endDate: null,
  });

  const [abrirArchivo, setAbrirArchivo] = useState<string>("");
  const esAutenticacionValida = useVerificarAutenticacion("Operador");

  const [currentPage, setCurrentPage] = useState<number>(1); // Página que se encuentra el usuario
  const [totalPageCount, setTotalPageCount] = useState<number>(1); // Total de páginas entregadas por el backend

  // const [userCantItems, setUserCantItems] = useState<number>(0); // Cantidad de objetos a mostrar en la lista
  const [descripcionSolicitud, setDescripcionSolicitud] = useState<string>(""); // Página que se encuentra el usuario

  // useEffect que obtiene lista de proveedores
  useEffect(() => {
    if (!esAutenticacionValida) {
      return;
    }
    try {
      HttpClient.get("proveedores/").then((response) => {
        setProveedores(response.data);
      });
    } catch (error) {}
  }, [esAutenticacionValida]);

  // useEffect para Cargar solicitudes
  useEffect(() => {
    if (!esAutenticacionValida) {
      return;
    }
    async function cargarSolicitudes() {
      try {
        if (
          currentPage < 1 ||
          isNaN(currentPage) ||
          typeof currentPage !== "number"
        ) {
          setCurrentPage(totalPageCount);
        } else if (currentPage > totalPageCount) {
          setCurrentPage(1);
        }

        const userIdResult = await obtenerIdUsuario();
        setUserId(userIdResult);

        const SolicitudResponse = await HttpClient.get(
          "solicitudes/solicitudes_por_operador/?id=" +
            userIdResult +
            "&page=" +
            currentPage +
            "&pageSize=25" +
            "&proveedorRut=" +
            filtroRutProveedor +
            "&startDate=" +
            filtroFecha.startDate +
            "&endDate=" +
            filtroFecha.endDate
        );

        const data: SolicitudDeUsuarioConFecha[] = SolicitudResponse.data.data;
        setSolicitudesData(data);
        setTotalPageCount(SolicitudResponse.data.total_pages);
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
      }
    }
    cargarSolicitudes();
  }, [
    esAutenticacionValida,
    currentPage,
    filtroRutProveedor,
    filtroFecha,
    totalPageCount,
  ]);

  // useEffect que obtiene todas las cotizaciones del usuario
  useEffect(() => {
    if (!esAutenticacionValida) {
      return;
    }
    if (userId === 0) {
      return;
    }
    try {
      HttpClient.get(
        "cotizaciones/cotizaciones_por_operador/?id=" + userId
      ).then((response) => {
        setCotizacionesPorUsuario(response.data);
      });
    } catch (error) {}
  }, [esAutenticacionValida, solicitudesData, userId]);

  function verArchivo(url: string) {
    if (url !== "") {
      window.open(`${url}`, "_blank", "noopener,noreferrer");
    }
  }

  // Funcion para descargar cotizaciones en formato zip
  async function descargarArchivos(id_solicitud: number): Promise<void> {
    Swal.fire({
      title: "Iniciando descarga...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const CotizacionesResponse: any = await HttpClient.get(
        "cotizaciones/cotizaciones_por_solicitud/?id_solicitud=" + id_solicitud
      );

      // Filtra y guarda solo las cotizaciones_archivo que no sean null
      const cotizacionesUrls: string[] = CotizacionesResponse.data
        .filter((cotizacion: any) => cotizacion.cotizaciones_archivo)
        .map((cotizacion: any) => cotizacion.cotizaciones_archivo);

      if (cotizacionesUrls.length > 0) {
        HttpClient.post(
          "solicitudes/download_documents_as_zip/",
          { cotizacionesUrls },
          { responseType: "arraybuffer" }
        )
          .then((response) => {
            const blob = new Blob([response.data], { type: "application/zip" });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Cotizaciones.zip");

            document.body.appendChild(link);
            link.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            Swal.close();
          })
          .catch((error) => {
            console.error("Error al descargar documentos ZIP:", error);
            Swal.close();
          });
      }
    } catch (error) {
      console.error("Error al obtener cotizaciones:", error);
      Swal.close();
    }
  }

  function verCotizaciones(idSolicitud: number) {
    if (idSolicitud !== 0) {
      setIdSolicitud(idSolicitud);
      setModalIsOpen((prevState) => ({
        ...prevState,
        cotizacionesModal: true,
      }));
    }
  }

  // Funcion para formatear Fecha y hora
  function formatDateTime(dateStr: string): string {
    const dateObj: Date = new Date(dateStr);
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const seconds = dateObj.getSeconds().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  function handleArchivoModal(fileUrl: string) {
    setAbrirArchivo(fileUrl);
    setModalIsOpen((prevState) => ({
      ...prevState,
      archivoModal: true,
    }));
  }
  // Función para cambiar estado de Recibida a En progreso
  async function validarEnProgreso(estado: string, id_solicitud: number) {
    if (
      estado === "En progreso" ||
      estado === "Aprobada" ||
      estado === "Rechazada"
    ) {
      return;
    } else {
      try {
        const datos = {
          id_solicitud: id_solicitud,
          estado: estado,
        };
        await HttpClient.patch("solicitudes/en_progreso_solicitud/", datos);
      } catch (error) {
        // swal("Error al cambiar estado de solicitud a en progreso.", "", "error")
      }
    }
  }

  // Funcion para renderizar proveedor
  const renderProveedorRow = (solicitud: SolicitudDeUsuarioConFecha) => (
    <tr key={solicitud.id_solicitud}>
      <td>{solicitud.id_solicitud}</td>
      <td>{solicitud.nombre_usuario}</td>
      <td>
        <button
          type="button"
          className="rounded-md hover:bg-gray-200 text-gray-400 py-2 px-3 mb-10 w-full"
          onClick={() => {
            setDescripcionSolicitud(solicitud.descripcion);
            setModalIsOpen((prevState) => ({
              ...prevState,
              descripcionModal: true,
            }));
          }}
        >
          <VisibilityIcon />
        </button>
      </td>
      <td>{solicitud.asignado_operador}</td>
      <td>{solicitud.id_cuentacontable}</td>
      <td>{solicitud.estado}</td>
      <td>
        <button
          type="button"
          className="rounded-md hover:bg-gray-200 text-gray-400 py-2 px-3 mb-10 w-full"
          onClick={() => {
            handleArchivoModal(solicitud.cuadro_comparativo_archivo);
            validarEnProgreso(solicitud.estado, solicitud.id_solicitud);
          }}
        >
          <FileOpenIcon />
        </button>
      </td>
      <td>
        <button
          type="button"
          className="rounded-md hover:bg-gray-200 text-gray-400 py-2 px-3 mb-10 w-full"
          onClick={() => {
            handleArchivoModal(solicitud.soc_archivo);
            validarEnProgreso(solicitud.estado, solicitud.id_solicitud);
          }}
        >
          <FileOpenIcon />
        </button>
      </td>
      <td>
        <button
          type="button"
          className="rounded-md hover:bg-gray-200 text-gray-400 py-2 px-3 mb-10 w-full"
          onClick={() => {
            verCotizaciones(solicitud.id_solicitud);
            validarEnProgreso(solicitud.estado, solicitud.id_solicitud);
          }}
        >
          <VisibilityIcon />
        </button>
      </td>
      <td>
        <ModalButton
          // label="Descargar"
          onClick={() => {
            descargarArchivos(solicitud.id_solicitud);
            validarEnProgreso(solicitud.estado, solicitud.id_solicitud);
          }}
        />
      </td>
      <td>{formatDateTime(solicitud.fecha_recibida.toString())}</td>
      <td>
        {solicitud.estado === "Asignada" ? (
          <button
            type="button"
            className="rounded-md bg-green-200 hover:bg-green-300 text-gray-600 py-2 px-3 mb-10 w-full"
            onClick={() => {
              setModalIsOpen((prevState) => ({
                ...prevState,
                resolverSolicitud: true,
              }));
              setIdSolicitud(solicitud.id_solicitud);
              validarEnProgreso(solicitud.estado, solicitud.id_solicitud);
            }}
          >
            <RateReviewIcon />
          </button>
        ) : solicitud.estado === "En progreso" ? (
          <button
            type="button"
            className="rounded-md bg-yellow-300 hover:bg-yellow-300 text-white text-bold py-2 px-3 mb-10 w-full"
            onClick={() => {
              setModalIsOpen((prevState) => ({
                ...prevState,
                resolverSolicitud: true,
              }));
              setIdSolicitud(solicitud.id_solicitud);
              validarEnProgreso(solicitud.estado, solicitud.id_solicitud);
            }}
          >
            <RateReviewIcon />
          </button>
        ) : (
          <button
            type="button"
            className="rounded-md bg-gray-300 text-white text-bold py-2 px-3 mb-10 w-full hover:cursor-not-allowed"
          >
            <RateReviewIcon />
          </button>
        )}
      </td>
    </tr>
  );

  /**
   *  Esto es para el selector de fechas
   */
  const handleValueChange = (newValue: any) => {
    setFiltroFecha(newValue);
  };

  return (
    <>
      <section className="container mx-auto bg-white rounded-md p-2">
        <TitleHeader title="SOLICITUDES ASIGNADAS" />

        <section className="mb-4 shadow-md p-2 border rounded-md bg-white">
          <div className="grid grid-cols-1">
            <label className="block mb-2 font-bold text-gray-900 text-center text-xl">
              Filtros:
            </label>
          </div>

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Nombre proveedor:
                </label>
                <SearchableSelect
                  options={proveedores.map((proveedor) => ({
                    label: proveedor.nombre_proveedor,
                    value: proveedor.rut_proveedor,
                  }))}
                  onChange={(selectedOption) => {
                    if (selectedOption) {
                      setFiltroRutProveedor(selectedOption.value);
                    } else {
                      setFiltroRutProveedor("");
                    }
                  }}
                  name="rut_proveedor"
                  required={false}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Fecha creación:
                </label>
                <div className="border-[1px] rounded-md -m-1 -pt-2 border-[#b3b3b3]">
                  <Datepicker
                    i18n={"es"}
                    primaryColor={"indigo"}
                    value={filtroFecha}
                    onChange={handleValueChange}
                    displayFormat={"DD/MM/YYYY"}
                    showShortcuts={true}
                    configs={{
                      shortcuts: {
                        yesterday: "Ayer",
                        past: (period) => `Los últimos ${period} días`,
                        currentMonth: "Mes actual",
                        pastMonth: "Mes pasado",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </form>
          {/* Para leer los datos se usar filtroFecha.startDate y filtroFecha.endDate */}
        </section>

        <div className="relative table-wrp block max-h-[32rem] overflow-x-auto shadow-md sm:rounded-lg border rounded-md bg-white">
          <table className="table bg-white sticky top-0">
            <thead className="bg-white border-b sticky top-0">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">SOLICITANTE</th>
                <th scope="col">DESCRIPCION</th>
                <th scope="col">OPERADOR ASIGNADO</th>
                <th scope="col">CUENTA CONTABLE</th>
                <th scope="col">ESTADO</th>
                <th scope="col">CUADRO COMPARATIVO</th>
                <th scope="col">SOLICITUD</th>
                <th scope="col">COTIZACIONES</th>
                <th scope="col">ARCHIVOS</th>
                <th scope="col">FECHA CREACIÓN</th>
                <th scope="col">RESOLVER</th>
              </tr>
            </thead>
            <tbody className="h-full overflow-y-auto">
              {solicitudesData?.map((solicitud) =>
                renderProveedorRow(solicitud)
              )}
            </tbody>
          </table>
        </div>

        <Paginator
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPageCount={totalPageCount}
        />
      </section>

      <CotizacionesModal
        isOpen={modalIsOpen.cotizacionesModal}
        onRequestClose={() => {
          setIdSolicitud(0);
          setModalIsOpen((prevState) => ({
            ...prevState,
            cotizacionesModal: false,
          }));
        }}
        idSolicitud={idSolicitud}
        verArchivo={verArchivo}
      />

      <TrackerModal
        isOpen={modalIsOpen.trackerModal}
        onRequestClose={() => {
          setIdSolicitud(0);
          setModalIsOpen((prevState) => ({
            ...prevState,
            trackerModal: false,
          }));
        }}
        idSolicitud={idSolicitud}
      />

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

      <ResolverModal
        isOpen={modalIsOpen.resolverSolicitud}
        onRequestClose={() => {
          setModalIsOpen((prevState) => ({
            ...prevState,
            resolverSolicitud: false,
          }));
        }}
        idSolicitud={idSolicitud}
      />

      <DescripcionModal
        isOpen={modalIsOpen.descripcionModal}
        onRequestClose={() => {
          setModalIsOpen((prevState) => ({
            ...prevState,
            descripcionModal: false,
          }));
          setDescripcionSolicitud("");
        }}
        descripcion={
          descripcionSolicitud ? descripcionSolicitud : "Sin descripción"
        }
      />
    </>
  );
}
