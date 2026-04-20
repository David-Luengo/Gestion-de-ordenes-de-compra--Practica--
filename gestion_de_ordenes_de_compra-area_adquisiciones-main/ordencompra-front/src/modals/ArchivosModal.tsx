import Modal from "react-modal";

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

Modal.setAppElement("#root");

interface ArchivoModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  abrirArchivo: string;
}

export default function ArchivosModal({
  isOpen,
  onRequestClose,
  abrirArchivo,
}: ArchivoModalProps) {
  const docs = [
    { uri: abrirArchivo }, // Remote file
  ];

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
      <div className="container mt-5 text-center h-full">
        <DocViewer
          documents={docs}
          theme={{
            disableThemeScrollbar: false,
          }}
          pluginRenderers={DocViewerRenderers}
        />
      </div>
    </Modal>
  );
}
