import { useEffect, useState } from "react";
import {
  Proveedor,
  SolicitudDeUsuarioConFecha,
} from "@interfaces/interfaces";
import HttpClient from "@helpers/provider";
import { obtenerIdUsuario } from "@funcionesTS/obtenerIdUsuario";
import "@/App.css";
import "@/Table.css";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import DonutSmallIcon from "@mui/icons-material/DonutSmall";
import PollIcon from "@mui/icons-material/Poll";
import Chart from "chart.js/auto";
import { format, parseISO, subDays } from "date-fns";

import ReactDataGrid from "@inovua/reactdatagrid-community";
import SelectFilter from "@inovua/reactdatagrid-community/SelectFilter";
import NumberFilter from "@inovua/reactdatagrid-community/NumberFilter";
import "@inovua/reactdatagrid-community/index.css";
import { useVerificarAutenticacion } from "@hooks/useVerificarAutenticacion";
import TitleHeader from "@components/shared/TitleHeader";

export default function TablaSolicitudes() {
  const [solicitudesData, setSolicitudesData] = useState<SolicitudDeUsuarioConFecha[]>([]);
  const [, setUserId] = useState<number>(0);
  const [, setProveedores] = useState<Proveedor[]>([]);
  // Crea const para cargar el total de cada estado y solicitud
  const [totalSolicitudes, setTotalSolicitudes] = useState(0);
  const [totalRecibida, setTotalRecibida] = useState(0);
  const [totalResueltas, setTotalResueltas] = useState(0);
  const [totalRechazada, setTotalRechazada] = useState(0);

  //grafico
  const [solicitudesPorFecha, setSolicitudesPorFecha] = useState<{ fecha: string; cantidad: number }[]>([]);

  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const esAutenticacionValida = useVerificarAutenticacion("Administrador");

  useEffect(() => {
    if (!esAutenticacionValida) {
      return;
    }

    if (solicitudesPorFecha.length > 0) {
      const canvas = document.getElementById(
        "solicitudesChart"
      ) as HTMLCanvasElement | null;
      if (canvas) {
        if (chartInstance) {
          chartInstance.destroy();
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Calcula los 7 días anteriores al día actual
          const fechas = [];
          for (let i = 31; i >= 0; i--) {
            fechas.push(format(subDays(new Date(), i), "yyyy-MM-dd"));
          }

          // Asegúrate de que los datos tengan todas las fechas
          const datosGrafico = fechas.map((fecha) => {
            const solicitud = solicitudesPorFecha.find(
              (item) => item.fecha === fecha
            );
            return solicitud ? solicitud.cantidad : 0;
          });

          const newChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
              labels: fechas, // Usar fechas calculadas
              datasets: [
                {
                  label: "SOLICITUDES POR FECHA",
                  data: datosGrafico, // Usar los datos calculados
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
              ],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "NÚMERO DE SOLICITUDES",
                    color: "black",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "FECHAS",
                    color: "black",
                  },
                },
              },
            },
          });
          setChartInstance(newChartInstance);
        }
      }
    }
  }, [esAutenticacionValida, solicitudesPorFecha, chartInstance]);

  // useEffect que obtiene lista de proveedores
  useEffect(() => {
    if (!esAutenticacionValida) {
      return;
    }
    if (obtenerIdUsuario() !== 0) {
      try {
        HttpClient.get("proveedores/").then((response) => {
          setProveedores(response.data);
        });
      } catch (error) { }
    }
  }, [esAutenticacionValida]);

  // useEffect para Cargar solicitudes
  useEffect(() => {
    if (!esAutenticacionValida) {
      return;
    }
    async function cargarSolicitudes() {
      try {
        const userIdResult = await obtenerIdUsuario();
        setUserId(userIdResult);
        if (userIdResult === 0) {
          return
        }
        const SolicitudResponse = await HttpClient.get(
          "solicitudes/todas_las_solicitudes"
        );
        const data: SolicitudDeUsuarioConFecha[] = SolicitudResponse.data.data;
        setSolicitudesData(data);

        const totalRecibida = data.filter(
          (solicitud) => solicitud.estado === "Recibida"
        ).length;
        setTotalRecibida(totalRecibida);
        const totalRechazada = data.filter(
          (solicitud) => solicitud.estado === "Rechazada"
        ).length;
        setTotalRechazada(totalRechazada);
        const totalResueltas = data.filter(
          (solicitud) => solicitud.estado === "Aprobada"
        ).length;
        setTotalResueltas(totalResueltas);

        setTotalSolicitudes(data.length);

        const solicitudesPorFechaMap: { [fecha: string]: number } = {};

        // Contar el número de solicitudes por fecha
        data.forEach((solicitud) => {
          const fechaRecibida = format(
            parseISO(new Date(solicitud.fecha_recibida).toISOString()),
            "yyyy-MM-dd"
          );
          if (solicitudesPorFechaMap[fechaRecibida]) {
            solicitudesPorFechaMap[fechaRecibida]++;
          } else {
            solicitudesPorFechaMap[fechaRecibida] = 1;
          }
        });

        // Convertir el mapa en un array de objetos
        const solicitudesPorFechaArray = Object.keys(
          solicitudesPorFechaMap
        ).map((fecha) => ({
          fecha,
          cantidad: solicitudesPorFechaMap[fecha],
        }));
        setSolicitudesPorFecha(solicitudesPorFechaArray);
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
      }
    }
    cargarSolicitudes();
  }, [esAutenticacionValida]);

  // Funcion para formatear Fecha y hora
  function formatDateTime(dateStr: string): string {
    const dateObj: Date = new Date(dateStr);
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const filterValue = [
    { name: "id_solicitud", operator: "eq", type: "number", value: undefined },
    { name: "estado", operator: "inlist", type: "select", value: "" },
  ];

  const columns = [
    {
      name: "id_solicitud",
      header: "ID SOLICITUD",
      minWidth: 10,
      defaultFlex: 1,
      type: "number",
      filter: "number",
      filterEditor: NumberFilter,
    },
    {
      name: "estado",
      header: "ESTADO",
      maxWidth: 1000,
      defaultFlex: 1,
      filterEditor: SelectFilter,
      filterEditorProps: {
        placeholder: "Todos",
        dataSource: [
          "Recibida",
          "Asignada",
          "En progreso",
          "Aprobada",
          "Rechazada",
        ].map((c) => {
          return { id: c, label: c };
        }),
      },
    },
    {
      name: "fecha_recibida",
      header: "FECHA CREACIÓN",
      maxWidth: 1000,
      defaultFlex: 1,
      render: ({ value }: { value: string }) => (
        <span>{formatDateTime(value)}</span>
      ),
    },
  ];

  const gridStyle = { minHeight: 550 };

  const dataSource = solicitudesData.map((solicitud) => {
    return {
      ...solicitud,
    };
  });

  return (
    <>
      <section className="container mx-auto">
        <div className="dashboard-container">
          <div className="bg-white p-2 rounded-md">
            <TitleHeader title="ESTADÍSTICAS" />
          </div>
          <div className="dashboard-container">
            <div className="row mt-2">
              <div className="col-xl-6 col-md-12 col-sm-12">
                <div
                  className="info-container bg-white rounded-md"
                  style={{ margin: "30px" }}
                >
                  <div className="container shadow-md p-10">
                    <canvas id="solicitudesChart"></canvas>
                  </div>
                </div>
              </div>

              <div className="col-md-3 flex items-center">
                <div
                  className="info-container d-flex flex-column"
                  style={{ width: "100%" }}
                >
                  <div className="container bg-white relative overflow-x-hidden shadow-md rounded-md sm:rounded-lg border">
                    <div className="info-box p-4">
                      <div className="d-flex align-items-center">
                        <label
                          style={{
                            fontSize: "50px",
                            color: "hsl(240, 50%, 70%)",
                          }}
                        >
                          {totalSolicitudes}
                        </label>
                        <DonutSmallIcon
                          style={{
                            fontSize: "70px",
                            marginLeft: "65%",
                            color: "hsl(240, 50%, 70%)",
                          }}
                        ></DonutSmallIcon>
                      </div>
                      <div style={{ background: "hsl(240, 50%, 70%)" }}>
                        <label
                          htmlFor=""
                          style={{
                            fontSize: "22px",
                            textAlign: "center",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          Total Solicitudes
                        </label>
                      </div>
                    </div>
                  </div>

                  <div
                    className="container  bg-white relative overflow-x-hidden shadow-md rounded-md sm:rounded-lg border"
                    style={{ marginTop: "20px" }}
                  >
                    <div className="info-box p-4">
                      <div className="d-flex align-items-center">
                        <label
                          style={{
                            fontSize: "50px",
                            color: "rgba(75, 192, 192, 1)",
                          }}
                        >
                          {totalRecibida}
                        </label>
                        <QueryStatsIcon
                          style={{
                            fontSize: "70px",
                            marginLeft: "65%",
                            color: "rgba(75, 192, 192, 1)",
                          }}
                        ></QueryStatsIcon>
                      </div>
                      <div style={{ background: "rgba(75, 192, 192, 1)" }}>
                        <label
                          htmlFor=""
                          style={{
                            fontSize: "22px",
                            textAlign: "center",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          Recibidas
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 flex items-center">
                <div className="info-container d-flex w-full flex-column">
                  <div className="container bg-white relative overflow-x-hidden shadow-md rounded-md sm:rounded-lg border">
                    <div className="info-box p-4 ">
                      <div className="d-flex align-items-center">
                        <label
                          style={{
                            fontSize: "50px",
                            color: "hsl(147, 50%, 47%)",
                          }}
                        >
                          {totalResueltas}
                        </label>
                        <PollIcon
                          style={{
                            fontSize: "70px",
                            marginLeft: "65%",
                            color: "hsl(147, 50%, 47%)",
                          }}
                        ></PollIcon>
                      </div>
                      <div style={{ background: "hsl(147, 50%, 47%)" }}>
                        <label
                          htmlFor=""
                          style={{
                            fontSize: "22px",
                            textAlign: "center",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          Aprobadas
                        </label>
                      </div>
                    </div>
                  </div>

                  <div
                    className="container bg-white relative overflow-x-hidden shadow-md rounded-md sm:rounded-lg border"
                    style={{ marginTop: "20px" }}
                  >
                    <div className="info-box p-4 ">
                      <div className="d-flex align-items-center">
                        <label
                          style={{
                            fontSize: "50px",
                            color: "hsl(0, 70%, 60%)",
                          }}
                        >
                          {totalRechazada}
                        </label>
                        <LeaderboardIcon
                          style={{
                            fontSize: "70px",
                            marginLeft: "65%",
                            color: "hsl(0, 70%, 60%)",
                          }}
                        ></LeaderboardIcon>
                      </div>
                      <div style={{ background: "hsl(0, 70%, 60%)" }}>
                        <label
                          htmlFor=""
                          style={{
                            fontSize: "22px",
                            textAlign: "center",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          Rechazadas
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 rounded-md mt-3">
            <h2 className="text-center mb-5 font-bold text-2xl bg-gray-200 p-4 rounded-md shadow-md">
              SOLICITUDES
            </h2>
            <ReactDataGrid
              idProperty="id_solicitud"
              columns={columns}
              dataSource={dataSource}
              style={gridStyle}
              defaultFilterValue={filterValue}
              enableColumnFilterContextMenu={false}
            />
          </div>
        </div>
      </section>
    </>
  );
}
