import Modal from "react-modal";

Modal.setAppElement("#root");

interface DescripcionModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  descripcion: string;
}

export default function DescripcionModal({
  isOpen,
  onRequestClose,
  descripcion,
}: DescripcionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Descripción Modal"
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
        onClick={onRequestClose}
      >
        Cerrar
      </button>

      <div className="flex justify-center items-center">
        <div className="text-center w-1/2">
          <h1 className="text-3xl mt-5 font-semibold">Descripción</h1>
          <p className="border p-5 rounded-md max-w-full mt-10">
            {descripcion}
          </p>
        </div>
      </div>
    </Modal>
  );
}
