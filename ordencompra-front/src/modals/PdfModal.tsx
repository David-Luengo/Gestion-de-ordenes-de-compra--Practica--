import Modal from "react-modal";

import { customModalStyle, iframeStyle, buttonStyle } from "./Styles";
Modal.setAppElement("#root");

interface PdfModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

export default function PdfModal({ isOpen, onRequestClose }: PdfModalProps) {
  const closeModal = () => {
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      contentLabel="PDF Modal"
      onRequestClose={onRequestClose}
      style={customModalStyle}
    >
      <button style={buttonStyle} onClick={closeModal}>
        Cerrar
      </button>
      <iframe
        src={"../pdf/ejemplo.pdf"}
        title="PDF Viewer"
        style={iframeStyle}
      ></iframe>
    </Modal>
  );
}
