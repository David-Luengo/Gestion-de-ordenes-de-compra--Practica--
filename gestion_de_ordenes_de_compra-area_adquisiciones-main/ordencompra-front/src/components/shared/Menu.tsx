import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Home from "@mui/icons-material/Home";
import Article from "@mui/icons-material/Article";
import LogoutIcon from "@mui/icons-material/Logout";

import { Link } from "react-router-dom";
import { obtenerRolUsuario } from "@funcionesTS/obtenerIdUsuario";
import { useEffect, useState } from "react";
import CecosModal from "@modals/CecosModal";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  background: "white",
  color: "black",
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function Menu({ children }: { children: any }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [rolUsuario, setRolUsuario] = useState<string>("");
  let direccionesUsuario;

  const [modalCeco, setModalCeco] = useState<boolean>(false);

  function stopError() {
    return true;
  }

  useEffect(() => {
    async function obtenerRol() {
      try {
        const rol: any = await obtenerRolUsuario();
        setRolUsuario(rol);
      } catch (error) {
        stopError();
      }
      return;
    }
    obtenerRol();
  }, []);

  switch (rolUsuario) {
    case "Operador":
      direccionesUsuario = [
        { text: "Inicio", icon: <Home />, uri: "/inicio_operador" },
        {
          text: "Solicitudes Asignadas",
          icon: <Article />,
          uri: "/solicitudes_operador",
        },
        { text: "Centro de costos", icon: <Article />, uri: "" },
        { text: "Cerrar sesión", icon: <LogoutIcon />, uri: "/" },
      ];
      break;
    case "Solicitante":
      direccionesUsuario = [
        { text: "Inicio", icon: <Home />, uri: "/inicio_usuario" },
        {
          text: "Mis Solicitudes",
          icon: <Article />,
          uri: "/solicitudes_usuario",
        },
        { text: "Centro de costos", icon: <Article />, uri: "" },
        { text: "Cerrar sesión", icon: <LogoutIcon />, uri: "/" },
      ];
      break;
    case "Administrador":
      direccionesUsuario = [
        { text: "Inicio", icon: <Home />, uri: "/inicio_administrador" },
        {
          text: "Solicitudes",
          icon: <Article />,
          uri: "/solicitudes_administrador",
        },
        { text: "Administrar", icon: <Article />, uri: "/administrar" },
        { text: "Centro de costos", icon: <Article />, uri: "" },
        { text: "Cerrar sesión", icon: <LogoutIcon />, uri: "/" },
      ];
      break;
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function handleLogout(): void {
    sessionStorage.removeItem("session_token");
  }

  function handleModalCeco(): void {
    setModalCeco(!modalCeco);
  }

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar color="white">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Gestión de ordenes de compra
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {direccionesUsuario?.map((item) => (
              <Link
                to={item.uri}
                key={item.text}
                className="no-underline text-black"
              >
                <ListItem
                  disablePadding
                  onClick={
                    item.text === "Cerrar sesión"
                      ? handleLogout
                      : item.text === "Centro de costos"
                      ? handleModalCeco
                      : undefined
                  }
                >
                  <ListItemButton>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText>{item.text}</ListItemText>
                  </ListItemButton>
                </ListItem>
              </Link>
            ))}
          </List>
        </Drawer>
        <Main open={open}>
          <DrawerHeader />
          {children}
        </Main>
      </Box>

      <CecosModal
        isOpen={modalCeco}
        onRequestClose={() => {
          setModalCeco(false);
        }}
        rolUsuario={rolUsuario}
      />
    </>
  );
}
