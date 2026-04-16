import { useState } from "react";
import Modal from "react-modal";
import { buttonStyle, divTitleStyle, rolesModalStyle } from "./Styles";
Modal.setAppElement("#root");

interface Role {
  id: number;
  rol: string;
}

interface RolesModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

export default function RolesModal({ isOpen, onRequestClose }: RolesModalProps) {
  const [roles] = useState<Role[]>([
    {
      id: 1001,
      rol: "ADMINISTRADOR",
    },
    {
      id: 1002,
      rol: "OPERADOR",
    },
    {
      id: 1003,
      rol: "SOLICITANTE",
    },
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Roles Modal"
      style={rolesModalStyle}
    >
      <button style={buttonStyle} onClick={onRequestClose}>
        Cerrar
      </button>

      <div style={divTitleStyle}>
        <h2>Roles</h2>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">ROL</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol) => (
            <tr key={rol.id}>
              <td>{rol.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}
