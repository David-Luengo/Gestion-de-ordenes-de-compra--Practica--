import Modal from "react-modal";
import "@inovua/reactdatagrid-community/index.css";
import FormularioRegistroArea from "@/components/Administrador/Administrar/FormularioRegistroArea";

Modal.setAppElement("#root");

interface DescripcionModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
}

export default function AdministradorFormularioArea({
    isOpen,
    onRequestClose,
}: DescripcionModalProps) {

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
                onClick={onRequestClose}
            >
                Cerrar
            </button>

            <div className="flex justify-center items-center">
                <div className="w-full">
                    <div className="text-center w-full">
                        <h1 className="text-3xl my-5 font-semibold">Formulario area</h1>
                    </div>
                    <FormularioRegistroArea />
                </div>
            </div>
        </Modal>
    );
}
