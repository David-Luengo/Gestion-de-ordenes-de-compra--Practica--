import React, { useEffect, useState } from "react";
import swal from "sweetalert";
import HttpClient from "@helpers/provider";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import {
  Cotizaciones,
  CuentasContables,
  Proveedor,
  Solicitud,
} from "@interfaces/interfaces";
import { Toaster, toast } from "sonner";
import {
  validarRUT,
  validarAddress,
  validarNombreProveedor,
  validarTextOpcional,
  validarNumeroTelOpcional,
  validarEmailOpcional,
} from "@funcionesTS/validaciones";
import { obtenerIdUsuario } from "@funcionesTS/obtenerIdUsuario";
import SearchableSelect from "@components/shared/SearchableSelect";
import InputField from "@components/shared/InputField";
import SelectField from "@components/shared/SelectField";
import InputFile from "@components/shared/InputFile";
import TextareaField from "@components/shared/TextAreaField";

const FormularioSolicitud: React.FC = () => {
  // Variables iniciales para Formularios
  const formSolicitudInitialState = {
    id_solicitud: 0,
    cuadro_comparativo_archivo: {
      name: "",
      type: "",
      size: "",
      path: "",
      lastModifiedDate: "",
    },
    soc_archivo: {
      name: "",
      type: "",
      size: "",
      path: "",
      lastModifiedDate: "",
    },
    descripcion: "",
    estado: "",
    rut_usuario: 0,
    id_cuentacontable: 0,
  };

  const formCotizacionInitialState = {
    id_cotizacion: 0,
    id_solicitud: 0,
    rut_proveedor: "",
    nombre_contacto_proveedor: "",
    telefono_contacto_proveedor: "",
    correo_contacto_proveedor: "",
    cotizaciones_archivo: {
      name: "",
      type: "",
      size: "",
      path: "",
      lastModifiedDate: "",
    },
    seleccionado: false,
  };

  const formProveedorInitialState = {
    id_proveedor: 0,
    rut_proveedor: "",
    nombre_proveedor: "",
    direccion: "",
  };

  const ValidacionErrorCotizacionInitialState = {
    nombre_contacto_proveedor: "",
    telefono_contacto_proveedor: "",
    correo_contacto_proveedor: "",
  };

  const ValidacionErrorProveedorInitialState = {
    rut_proveedor: "",
    nombre_proveedor: "",
    direccion: "",
  };

  // Estados
  const [data, setData] = useState([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cuentasContables, setCuentasContables] = useState<CuentasContables[]>(
    []
  );
  const [, setModalActualizar] = useState(false);
  const [modalInsertar, setModalInsertar] = useState(false);
  const [modalRegistroProveedor, setModalRegistroProveedor] = useState(false);
  const [userId, setUserId] = useState<number>(0);
  const [formCotizacion, setFormCotizacion] = useState<Cotizaciones>(
    formCotizacionInitialState
  );
  const [formProveedor, setFormProveedor] = useState<Proveedor>(
    formProveedorInitialState
  );
  const [formSolicitud, setFormSolicitud] = useState<Solicitud>(
    formSolicitudInitialState
  );
  const [validacionErrorCotizacion, setValidacionErrorCotizacion] = useState(
    ValidacionErrorCotizacionInitialState
  );
  const [validacionErrorProveedor, setValidacionErrorProveedor] = useState(
    ValidacionErrorProveedorInitialState
  );
  const [NombreProveedorSelecionado, SetNombreProveedorSelecionado] =
    useState<string>("");
  //Estado para key de la lista de cotizaciones
  const [contadorId, setContadorId] = useState(1);

  // Funciones que manejan estado de los modales
  const mostrarModalInsertar = () => {
    setModalInsertar(true);
  };

  const cerrarModalInsertar = () => {
    setModalInsertar(false);
    setFormCotizacion(formCotizacionInitialState);
    setValidacionErrorCotizacion(ValidacionErrorCotizacionInitialState);
    SetNombreProveedorSelecionado("");
  };

  const mostrarModalRegistroProveedor = () => {
    setModalRegistroProveedor(true);
  };

  const cerrarModalRegistroProveedor = () => {
    setModalRegistroProveedor(false);
    setFormProveedor(formProveedorInitialState);
    setValidacionErrorProveedor(ValidacionErrorProveedorInitialState);
  };

  // useEffect que obtiene el id de la sesion activa
  useEffect(() => {
    try {
      const userIdResult = obtenerIdUsuario();
      userIdResult !== 0 ? setUserId(userIdResult) : setUserId(0);
    } catch (error) {
      swal("Error", "Problemas con el servidor.", "error");
    }
  }, []);

  // useEffect que obtiene lista de proveedores
  useEffect(() => {
    try {
      HttpClient.get("proveedores/").then((response) => {
        setProveedores(response.data);
      });
    } catch (error) {}
  }, [modalRegistroProveedor]);

  // useEffect que obtiene las cuentas contables de su id ceco
  useEffect(() => {
    try {
      if (userId !== 0) {
        HttpClient.get(
          "cuentacontable/cuentas_contables_por_usuario/?user_id=" + userId
        ).then((response) => {
          setCuentasContables(response.data);
        });
      }
    } catch (error) {}
  }, [userId]);

  // Función para manejo de errores de validación
  const handleFieldError = (name: string, error: string) => {
    if (
      name === "rut_proveedor" ||
      name === "nombre_proveedor" ||
      name === "direccion"
    ) {
      setValidacionErrorProveedor((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    } else {
      setValidacionErrorCotizacion((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }
  };

  const checkNombreProveedor = async (rut: string) => {
    try {
      const proveedorEncontrado = proveedores.find(
        (proveedor: Proveedor) => proveedor.rut_proveedor === rut
      );

      if (proveedorEncontrado) {
        SetNombreProveedorSelecionado(proveedorEncontrado.nombre_proveedor);
      } else {
        SetNombreProveedorSelecionado("");
      }
      return;
    } catch (error) {
      return false;
    }
  };

  // Funcion para insertar cotizacion a la lista
  const insertar = async () => {
    const hasValidationErrors = Object.values(validacionErrorCotizacion).some(
      (error) => error !== ""
    );
    if (hasValidationErrors) {
      swal("Error", "Verifique los campos", "error");
      return;
    }

    const rut_proveedor = formCotizacion.rut_proveedor;

    if (!rut_proveedor) {
      swal("Advertencia", "Debe seleccionar un proveedor", "warning");
      return;
    }

    const valorNuevo = {
      ...formCotizacion,
      id_cotizacion: contadorId,
      razon_social: NombreProveedorSelecionado,
    };
    const lista = data;
    const limite = 5;
    if (lista.length >= limite) {
      swal({
        title: "Solo puede ingresar 5 cotizaciones",
        icon: "error",
      });
    } else {
      if (valorNuevo.seleccionado) {
        // Validar si ya existe un objeto con seleccionado en true
        if (lista.some((item: any) => item.seleccionado)) {
          swal("Error", "Ya existe una cotizacion seleccionada", "error");
          return;
        }
      }

      lista.push(valorNuevo as never);
      setModalInsertar(false);
      setData(lista);
      setFormCotizacion(formCotizacionInitialState);
      SetNombreProveedorSelecionado("");
      setContadorId(contadorId + 1);
    }
  };

  // Funcion para eliminar cotizacion de la lista
  const eliminar = (dato: any) => {
    const opcion = window.confirm(
      "Estás Seguro que deseas Eliminar la cotización"
    );

    if (opcion) {
      const arreglo = data.filter(
        (registro: any) => dato.id_cotizacion !== registro.id_cotizacion
      );
      setData(arreglo);
      setModalActualizar(false);
    }
  };

  // Funciones para actualizar estados
  const handleChangeForm = (
    e: React.ChangeEvent<HTMLInputElement>,
    stateSetter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    if (!e || !e.target) {
      return;
    }

    let { name, value, files } = e.target;

    if (!name) {
      return;
    }

    if (files && files.length > 0) {
      const maxFileSizeInMB = 2;
      const maxFileSizeInKB = 1024 * 1024 * maxFileSizeInMB;
      const file = files[0];
      if (file.size > maxFileSizeInKB) {
        swal("Advertencia", "El peso máximo de archivo es 2MB", "warning");
        // Limpiar el campo de entrada de tipo archivo
        const inputElement = document.querySelector(`input[name="${name}"]`);
        if (inputElement) {
          (inputElement as HTMLInputElement).value = "";
          value = "";
        }
      }
    }

    stateSetter((prevState: any) => ({
      ...prevState,
      [name]:
        (name === "cotizaciones_archivo" ||
          name === "cuadro_comparativo_archivo" ||
          name === "soc_archivo") &&
        files &&
        files.length > 0
          ? files[0]
          : value,
    }));
  };

  const handleChangeFormCotizacion = (e: any) => {
    handleChangeForm(e, setFormCotizacion);
  };

  const handleChangeFormProveedor = (e: any) => {
    handleChangeForm(e, setFormProveedor);
  };

  const handleChangeFormSolicitud = (e: any) => {
    handleChangeForm(e, setFormSolicitud);
  };

  // Funcion para enviar formulario
  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    //Valida que exista por lo menos 1 cotizacion
    if (data.length <= 0) {
      swal("Advertencia", "Debe ingresar al menos 1 cotización", "warning");
      return;
    }

    // Verifica que exista por lo menos 1 cotización con cotizaciones_archivo
    if (
      !data.some(
        (item: any) =>
          item.cotizaciones_archivo && item.cotizaciones_archivo.name
      )
    ) {
      swal(
        "Advertencia",
        "Debe ingresar al menos 1 cotización con archivo",
        "warning"
      );
      return;
    }
    //Verifica que exista por lo menos 1 cotizacion seleccionada
    if (!data.some((item: any) => item.seleccionado === true)) {
      swal(
        "Advertencia",
        "Debe haber al menos 1 cotización seleccionada.",
        "warning"
      );
      return;
    }

    //Guardo los datos de la solicitud en una constante
    const datoSolicitud = {
      cuadro_comparativo_archivo: formSolicitud.cuadro_comparativo_archivo,
      soc_archivo: formSolicitud.soc_archivo,
      descripcion: formSolicitud.descripcion,
      rut_usuario: userId,
      id_cuentacontable: formSolicitud.id_cuentacontable,
    };

    try {
      //Realiza una solicitud postform a /solicitudes utilizando la constante datoSolicitud
      const solicitudResponse = await HttpClient.postForm(
        "/solicitudes/",
        datoSolicitud
      );

      // Recorre los elementos de data y envía una solicitud POST a /cotizaciones para cada uno
      data.forEach(async (dato: any) => {
        const datoCotizaciones = {
          id_solicitud: solicitudResponse.data.id_solicitud,
          rut_proveedor: dato.rut_proveedor,
          nombre_contacto_proveedor: dato.nombre_contacto_proveedor,
          telefono_contacto_proveedor: dato.telefono_contacto_proveedor,
          correo_contacto_proveedor: dato.correo_contacto_proveedor,
          cotizaciones_archivo: dato.cotizaciones_archivo,
          seleccionado: dato.seleccionado,
        };

        await HttpClient.postForm("/cotizaciones/", datoCotizaciones);
      });

      if (solicitudResponse.status === 201) {
        //Reinicia a valores iniciales
        setData([]);
        setFormSolicitud(formSolicitudInitialState);
        const cuadroComparativoInput = document.getElementById(
          "cuadro_comparativo_archivo"
        ) as HTMLInputElement;
        const solicitudCompraInput = document.getElementById(
          "soc_archivo"
        ) as HTMLInputElement;

        // Los input tipo file vuelven al valor inicial
        cuadroComparativoInput.value = "";
        solicitudCompraInput.value = "";

        swal(
          "Su Solicitud con ID: " +
            solicitudResponse.data.id_solicitud +
            " se encuentra en estado:",
          "Recibida",
          "success"
        );

        // Envío de correo
        const datoUsuarioCorreo = {
          userid: userId, // tengo 1 -> pero debe ser 26580508-6
          solicitud_id: solicitudResponse.data.id_solicitud,
        };

        const emailResponse = await HttpClient.post(
          "/solicitudes/correo_solicitud/?userid=" +
            datoUsuarioCorreo.userid +
            "&solicitud_id=" +
            datoUsuarioCorreo.solicitud_id
        );

        if (emailResponse.status === 200) {
          toast.success("Un correo ha sido enviado");
        }
      }
    } catch (error) {
      swal("Error", "Hubo un problema al enviar la solicitud", "error");
    }
  };

  // Funcion para registrar proveedor
  const registrarProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    const { rut_proveedor, nombre_proveedor, direccion } = formProveedor;

    const hasValidationErrors = Object.values(validacionErrorProveedor).some(
      (error) => error !== ""
    );

    if (hasValidationErrors) {
      swal("Error", "Verifique los campos", "error");
      return;
    }

    try {
      //Guardo los datos de Proveedor en una constante
      const datoProveedor = {
        rut_proveedor: rut_proveedor,
        nombre_proveedor: nombre_proveedor,
        direccion: direccion,
      };

      const proveedorResponse = await HttpClient.postForm(
        "/proveedores/",
        datoProveedor
      );

      if (proveedorResponse.status === 201) {
        toast.success("Proveedor registrado correctamente");
        cerrarModalRegistroProveedor();
      }
    } catch (error: any) {
      // toast.error("Error al registrar el proveedor");
      if (error.data.error) {
        console.error("Error al registrar el proveedor:", error.data.error);
        swal("Error", error.data.error, "error");
      }
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <section className="container mx-auto">
        <div className="border sm:rounded-xl bg-white shadow-md p-10">
          <h1 className="mb-4 font-serif font-semibold text-2xl">
            Solicitud de Compra
          </h1>

          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-10"
            onClick={mostrarModalInsertar}
          >
            Ingresar Cotizacion
          </button>

          <div className="relative overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Rut Proveedor</th>
                  <th>Razón Social</th>
                  <th>Nombre Contacto Proveedor</th>
                  <th>Correo Contacto Proveedor</th>
                  <th>Teléfono Contacto Proveedor</th>
                  <th>Seleccionado</th>
                  <th>Cotización</th>
                </tr>
              </thead>
              <tbody>
                {data.map((dato: any) => (
                  <tr key={dato.id_cotizacion}>
                    <td>{dato.rut_proveedor}</td>
                    <td>{dato.razon_social}</td>
                    <td>{dato.nombre_contacto_proveedor}</td>
                    <td>{dato.correo_contacto_proveedor}</td>
                    <td>{dato.telefono_contacto_proveedor}</td>
                    <td>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          readOnly
                          checked={dato.seleccionado}
                          className="h-7 w-7 opacity-100 pointer-events-none"
                        />
                      </div>
                    </td>
                    <td>{dato.cotizaciones_archivo.name}</td>
                    <td>
                      <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => eliminar(dato)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Ingresar Cotizacion*/}

          <Modal
            style={{ marginTop: "70px ", width: "100%!important" }}
            isOpen={modalInsertar}
          >
            <ModalHeader>
              <div>
                <h3>Ingresar Cotizacion</h3>
              </div>
            </ModalHeader>

            <ModalBody>
              <form
                onSubmit={(e: any) => {
                  e.preventDefault();
                  insertar();
                }}
              >
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Rut proveedor:
                  </label>
                  <SearchableSelect
                    options={proveedores.map((proveedor) => ({
                      label: proveedor.rut_proveedor,
                      value: proveedor.rut_proveedor,
                    }))}
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        setFormCotizacion((prevForm) => ({
                          ...prevForm,
                          rut_proveedor: selectedOption.value, // Update rut_proveedor
                        }));
                        checkNombreProveedor(selectedOption.value);
                      }
                    }}
                    name="rut_proveedor"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Razon Social Proveedor:
                  </label>
                  <input
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    name="nombre_contacto_proveedor"
                    type="text"
                    value={NombreProveedorSelecionado}
                    placeholder=""
                    disabled
                    required
                  />
                </div>

                {/* Botón para abrir el modal de registro de proveedor */}
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-2"
                  onClick={mostrarModalRegistroProveedor}
                  type="button"
                >
                  Registrar nuevo proveedor
                </button>

                <InputField
                  label="Nombre Contacto Proveedor (opcional)"
                  type="text"
                  name="nombre_contacto_proveedor"
                  value={formCotizacion.nombre_contacto_proveedor}
                  onChange={handleChangeFormCotizacion}
                  placeholder="ej: Rodrigo Andres Gomez Echeverria"
                  validationFunction={validarTextOpcional}
                  errorMessage="No se permiten caracteres especiales, solo letras."
                  setFieldError={handleFieldError}
                  required={false}
                />

                <InputField
                  label="Teléfono Contacto Proveedor (opcional)"
                  type="text"
                  name="telefono_contacto_proveedor"
                  value={formCotizacion.telefono_contacto_proveedor}
                  onChange={handleChangeFormCotizacion}
                  placeholder="ej: 56958393842"
                  validationFunction={validarNumeroTelOpcional}
                  errorMessage="El número ingresado no es válido, el formato es 56912345678."
                  setFieldError={handleFieldError}
                  required={false}
                />

                <InputField
                  label="Correo Contacto Proveedor (opcional)"
                  type="email"
                  name="correo_contacto_proveedor"
                  value={formCotizacion.correo_contacto_proveedor}
                  onChange={handleChangeFormCotizacion}
                  placeholder="ej: rodrigogomez@gmail.com"
                  validationFunction={validarEmailOpcional}
                  errorMessage="El correo ingresado no es válido, el formato es ejemplo@ejemplo.com."
                  setFieldError={handleFieldError}
                  required={false}
                />

                <InputFile
                  label="Cotizaciones (opcional):"
                  name="cotizaciones_archivo"
                  onChange={handleChangeFormCotizacion}
                  accept=".pdf, .xls, .xlsx"
                />

                <div className="mb-4 flex items-center flex-col">
                  <label className="block text-gray-700 font-medium mb-2">
                    Seleccionar
                  </label>
                  <input
                    type="checkbox"
                    name="seleccionado"
                    checked={formCotizacion.seleccionado}
                    onChange={(e) =>
                      setFormCotizacion((prevForm) => ({
                        ...prevForm,
                        seleccionado: e.target.checked,
                      }))
                    }
                    className="h-7 w-7"
                  />
                </div>

                <div className="text-right">
                  <button
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                    type="submit"
                  >
                    Insertar
                  </button>
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    type="button"
                    onClick={() => cerrarModalInsertar()}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </ModalBody>
          </Modal>

          {/* Modal Registro Proveedor*/}
          <Modal
            style={{ marginTop: "70px ", width: "100%!important" }}
            isOpen={modalRegistroProveedor}
          >
            <ModalHeader>
              <div>
                <h3>Registrar Nuevo Proveedor</h3>
              </div>
            </ModalHeader>

            <ModalBody>
              <form onSubmit={registrarProveedor}>
                <InputField
                  label="Rut Proveedor"
                  type="text"
                  name="rut_proveedor"
                  value={formProveedor.rut_proveedor}
                  onChange={handleChangeFormProveedor}
                  placeholder="ej: 77123456-7"
                  validationFunction={validarRUT}
                  errorMessage="El rut debe tener formato 77111222-3."
                  setFieldError={handleFieldError}
                />

                <InputField
                  label="Nombre Proveedor"
                  type="text"
                  name="nombre_proveedor"
                  value={formProveedor.nombre_proveedor}
                  onChange={handleChangeFormProveedor}
                  placeholder="ej: Movistar"
                  validationFunction={validarNombreProveedor}
                  errorMessage="El nombre proveedor no puede poseer caracteres especiales."
                  setFieldError={handleFieldError}
                />

                <InputField
                  label="Direccion Proveedor"
                  type="text"
                  name="direccion"
                  value={formProveedor.direccion}
                  onChange={handleChangeFormProveedor}
                  placeholder="ej: Av flores 1665, providencia"
                  validationFunction={validarAddress}
                  errorMessage="La direccion no puede poseer caracteres especiales."
                  setFieldError={handleFieldError}
                />

                <div className="text-right">
                  <button
                    type="submit"
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Registrar
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    onClick={() => cerrarModalRegistroProveedor()}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </ModalBody>
          </Modal>

          {/* Formulario enviar solicitud*/}
          <form onSubmit={enviarFormulario} encType="multipart/form-data">
            <div className="form-group row p-20 mt-20">
              <div className="col-sm-9">
                <InputFile
                  label="Cuadro Comparativo"
                  name="cuadro_comparativo_archivo"
                  onChange={handleChangeFormSolicitud}
                  accept=".pdf, .xls, .xlsx"
                  required
                />

                <InputFile
                  label="Solicitud de Orden de compra"
                  name="soc_archivo"
                  onChange={handleChangeFormSolicitud}
                  accept=".pdf, .xls, .xlsx"
                  required
                />

                <SelectField
                  label="Cuenta Contable"
                  name="id_cuentacontable"
                  value={formSolicitud.id_cuentacontable}
                  onChange={handleChangeFormSolicitud}
                  options={[
                    { value: "", label: "Selecciona una cuenta" },
                    ...cuentasContables.map((cuenta) => ({
                      value: cuenta.id_cuentacontable,
                      label: cuenta.id_cuentacontable,
                    })),
                  ]}
                  errorMessage="Seleccione una cuenta contable"
                  setFieldError={handleFieldError}
                  required={true}
                />
              </div>
            </div>

            <TextareaField
              label="Descripciones de compra"
              name="descripcion"
              value={formSolicitud.descripcion}
              onChange={handleChangeFormSolicitud}
              required
              rows={5}
              cols={80}
            />

            <div className="text-center">
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-10"
                type="submit"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default FormularioSolicitud;
