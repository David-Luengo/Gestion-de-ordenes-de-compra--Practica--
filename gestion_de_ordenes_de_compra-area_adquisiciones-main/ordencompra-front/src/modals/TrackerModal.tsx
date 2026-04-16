import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { SolicitudDeUsuarioConFecha } from "@interfaces/interfaces";
import HttpClient from "@helpers/provider";

Modal.setAppElement("#root");

interface TrackerModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  idSolicitud: number;
}

export default function TrackerModal({
  isOpen,
  onRequestClose,
  idSolicitud,
}: TrackerModalProps) {
  const [solicitudes, setSolicitudes] = useState<any>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  useEffect(() => {
    if (idSolicitud) {
      const fetchSolicitud = async () => {
        try {
          const response = await HttpClient.get(
            "solicitudes/solicitud/?id_solicitud=" + idSolicitud
          );
          const data: SolicitudDeUsuarioConFecha[] = response.data;
          setSolicitudes([data]);
        } catch (error) {
          console.error("Error al obtener la solicitud:", error);
        }
      };

      fetchSolicitud();
    }
  }, [idSolicitud]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < solicitudes.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, solicitudes]);

  useEffect(() => {
    if (!isOpen) {
      setSolicitudes([]);
      setCurrentIndex(0);
    }
  }, [isOpen]);

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
          width: "50%",
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

      <div className="container mt-5 text-center">
        <h1 className="text-xl md:text-3xl font-bold">
          Seguimiento de solicitud
        </h1>

        <svg width="300" height="600" className="mx-auto">
          {/* <line x1="50" y1="50" x2="50" y2="550" stroke="green" strokeWidth="10"></line> */}
          {solicitudes.map((solicitud: any, index: number) => (
            <React.Fragment key={`custom-circle-${index}`}>
              <circle
                cx="50"
                cy={60 + index * 100}
                r="20"
                fill={
                  solicitud.estado === "Recibida" ||
                  solicitud.estado === "Asignada" ||
                  solicitud.estado === "En progreso" ||
                  solicitud.estado === "Aprobada" ||
                  solicitud.estado === "Rechazada"
                    ? "green"
                    : "yellow"
                }
              />
              <text
                x="80"
                y={60 + index * 100}
                fill="black"
                style={{
                  fontFamily: "Arial",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                RECIBIDA
              </text>
              <text
                x="80"
                y={80 + index * 100}
                fill="black"
                style={{ fontFamily: "Arial", fontSize: "15px" }}
              >
                {formatDateTime(solicitud.fecha_recibida)}
              </text>

              <line
                x1="50"
                y1="79"
                x2="50"
                y2="230"
                strokeWidth="10"
                stroke={
                  solicitud.estado === "Asignada" ||
                  solicitud.estado === "En progreso" ||
                  solicitud.estado === "Aprobada" ||
                  solicitud.estado === "Rechazada"
                    ? "green"
                    : "yellow"
                }
              />
            </React.Fragment>
          ))}
          {solicitudes.map((solicitud: any, index: number) => (
            <React.Fragment key={`custom-circle-${index}`}>
              <circle
                cx="50"
                cy={230 + index * 100}
                r="20"
                fill={
                  solicitud.estado === "Asignada" ||
                  solicitud.estado === "En progreso" ||
                  solicitud.estado === "Aprobada" ||
                  solicitud.estado === "Rechazada"
                    ? "green"
                    : "yellow"
                }
              />
              <text
                x="80"
                y={230 + index * 100}
                fill="black"
                style={{
                  fontFamily: "Arial",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                ASIGNADA
                
              </text>
              <text
                x="80"
                y={250 + index * 100}
                fill="black"
                style={{ fontFamily: "Arial", fontSize: "15px" }}
              >
                {solicitud.fecha_asignada &&
                  formatDateTime(solicitud.fecha_asignada)}
              </text>
              <text
                x="80"
                y={270 + index * 100}
                fill="black"
                style={{ fontFamily: "Arial", fontSize: "15px" }}
                className="truncate"
              >
                {solicitud.asignado_operador &&
                  `- ${solicitud.asignado_operador}`}
              </text>

              <line
                x1="50" //
                y1="300" //
                x2="50" //
                y2="249" //
                strokeWidth="10"
                stroke={
                  solicitud.estado === "Asignada" ||
                  solicitud.estado === "En progreso" ||
                  solicitud.estado === "Aprobada"
                    ? "green"
                    : "yellow"
                }
              />
            </React.Fragment>
          ))}
          {solicitudes.map((solicitud: any, index: number) => (
            <React.Fragment key={`custom-circle-${index}`}>
              <circle
                cx="50"
                cy={400 + index * 100}
                r="20"
                fill={
                  solicitud.estado === "En progreso" ||
                  solicitud.estado === "Aprobada" ||
                  solicitud.estado === "Rechazada"
                    ? "green"
                    : "yellow"
                }
              />
              <text
                x="80"
                y={400 + index * 100}
                fill="black"
                style={{
                  fontFamily: "Arial",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                EN PROGRESO
              </text>
              <text
                x="80"
                y={420 + index * 100}
                fill="black"
                style={{ fontFamily: "Arial", fontSize: "15px" }}
              >
                {solicitud.fecha_en_progreso &&
                  formatDateTime(solicitud.fecha_en_progreso)}
              </text>

              <line
                x1="50" //
                y1="410" //
                x2="50" //
                y2="249" //
                strokeWidth="10"
                stroke={
                  solicitud.estado === "En progreso" ||
                  solicitud.estado === "Aprobada" ||
                  solicitud.estado === "Rechazada"
                    ? "green"
                    : "yellow"
                }
              />
            </React.Fragment>
          ))}
          {solicitudes.map((solicitud: any, index: number) => (
            <React.Fragment key={`custom-circle-${index}`}>
              <circle
                cx="50"
                cy={550 + index * 100}
                r="20"
                fill={
                  solicitud.estado === "Aprobada"
                    ? "green"
                    : solicitud.estado === "Rechazada"
                    ? "red"
                    : "yellow"
                }
                className="z-50"
              />
              <text
                x="80"
                y={550 + index * 100}
                fill="black"
                style={{
                  fontFamily: "Arial",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {solicitud.estado === "Aprobada"
                  ? "APROBADA"
                  : solicitud.estado === "Rechazada"
                  ? "RECHAZADA"
                  : " "}
              </text>
              <text
                x="80"
                y={570 + index * 100}
                fill="black"
                style={{ fontFamily: "Arial", fontSize: "15px" }}
              >
                {solicitud.fecha_finalizada &&
                  formatDateTime(solicitud.fecha_finalizada)}
              </text>

              <line
                x1="50" //
                y1="550" //
                x2="50" //
                y2="419" //
                strokeWidth="10"
                stroke={
                  solicitud.estado === "Aprobada" ||
                  solicitud.estado === "Rechazada"
                    ? solicitud.estado === "Rechazada"
                      ? "red"
                      : "green"
                    : "yellow"
                }
              />
            </React.Fragment>
          ))}
        </svg>
      </div>
    </Modal>
  );
}
