import Modal from "react-modal";
import "@inovua/reactdatagrid-community/index.css";
import FormularioEditarCeco from "@/components/Administrador/Administrar/FormularioEditarCeco";

Modal.setAppElement("#root");

interface EditarUsuariosModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  ceco: number;
}

export default function AdministradorEditarCeco({
  isOpen,
  onRequestClose,
  ceco,
}: EditarUsuariosModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Formulario usuarios"
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
          height: "80%",
        },
      }}
    >
      <button
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-10 absolute top-4 right-4"
        onClick={() => {
          onRequestClose();
        }}
      >
        Cerrar
      </button>

      <FormularioEditarCeco ceco={ceco} />
    </Modal>
  );
}
