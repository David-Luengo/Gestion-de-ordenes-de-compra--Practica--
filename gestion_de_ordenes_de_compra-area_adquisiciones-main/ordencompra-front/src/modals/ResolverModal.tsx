import { useEffect, useState } from "react";
import Modal from "react-modal";

import TextareaField from "@/components/shared/TextAreaField";
import HttpClient from "@/helpers/provider";

import swal from "sweetalert";

Modal.setAppElement("#root");

interface ArchivoModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  idSolicitud: number;
}

export default function ResoverModal({
  isOpen,
  onRequestClose,
  idSolicitud,
}: ArchivoModalProps) {
  const [dineroSolicitud, setDineroSolicitud] = useState<number>();
  const [descripcionOperador, setDescripcionOperador] = useState<string>("");
  const [estadoSolicitud, setEstadoSolicitud] = useState<string>("");

  const [errorState, setErrorState] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (errorState) {
      swal(errorState, "", "warning");
    }
  }, [errorState]);

  async function handleProceso(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    try {
      setErrorState("");
      setLoading(true);

      const datos = {
        solicitud_id: idSolicitud,
        estado: estadoSolicitud,
        descripcion_operador: descripcionOperador,
        dinero_solicitud: dineroSolicitud,
      };

      if (!dineroSolicitud) {
        setErrorState("Debes indicar la cantidad de dinero.");
        swal(errorState, "", "warning");
        setLoading(false);
        return;
      } else if (dineroSolicitud <= 1) {
        setErrorState("Debes indicar una cantidad de dinero mayor a 0.");
        swal(errorState, "", "warning");
        setLoading(false);
        return;
      }

      await HttpClient.patch("solicitudes/procesar_solicitud/", datos);

      await HttpClient.post("solicitudes/correo_solicitud_resuelta/", datos);

      onRequestClose();

      swal(
        "Solicitud procesada exitosamente, enviamos correos a los involucrados.",
        "",
        "success"
      ).then(() => {
        window.location.reload(); // Recargar la página después de cerrar la alerta
      });
    } catch (error) {
      swal(`Error en el procesamiento de la solicitud. ${error}`, "", "error").then(
        () => {
          // window.location.reload();
        }
      );
      setLoading(false);
    }
    // Resuelta o rechazada
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        onRequestClose();
        setErrorState("");
        setDineroSolicitud(undefined);  
      }}
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
        onClick={() => {
          onRequestClose();
          setDescripcionOperador("");
        }}
      >
        Cerrar
      </button>

      <div className="container mx-auto">
        <h2 className="text-center text-4xl font-bold">Resolver solicitud</h2>

        <form className="mt-14" onSubmit={handleProceso}>
          <label className="block mb-2 font-medium text-gray-700 text-xl">
            Monto de la orden de compra solicitada:
          </label>
          <section className="flex items-center gap-0 mb-4">
            <div className="p-2 px-3 border border-gray-300 rounded-l-md bg-gray-300 font-bold select-none">
              CLP$
            </div>
            <input
              type="number"
              value={dineroSolicitud}
              onChange={(ev) => setDineroSolicitud(Number(ev.target.value))}
              className="w-full p-2 border border-gray-300 rounded-r-md"
              placeholder="14990"
            />
          </section>

          <TextareaField
            label={"Comentarios"}
            name={"descripcion_operador"}
            value={descripcionOperador}
            onChange={(ev) => {
              setDescripcionOperador(ev.target.value);
            }}
            required={false}
            rows={10}
          />

          <div className="flex justify-center items-center gap-4 mt-3">
            <button
              type="submit"
              onClick={() => setEstadoSolicitud("Aprobada")}
              className={
                `p-2 px-4 border rounded-md bg-green-300 hover:bg-green-200 font-bold` +
                `${loading && " cursor-not-allowed text-white"}`
              }
              disabled={loading}
            >
              Aprobar
            </button>
            <button
              type="submit"
              onClick={() => setEstadoSolicitud("Rechazada")}
              className={
                `p-2 px-3 border rounded-md bg-red-300 hover:bg-red-200 font-bold` +
                `${loading && " cursor-not-allowed text-white"}`
              }
              disabled={loading}
            >
              Rechazar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
