import { LazyComponent, RoutesMap } from '@/types';
import { lazy } from 'react';

const LazyInicioUsuarioPage: LazyComponent = lazy(() => import('../pages/Usuario/inicioUsuario'));
const LazyInicioOperadorPage: LazyComponent = lazy(() => import('../pages/Operador/InicioOperador'));
const LazyInicioAdministradorPage: LazyComponent = lazy(() => import('../pages/Administrador/InicioAdministrador'));
const LazyFormularioPage: LazyComponent = lazy(() => import('../pages/FormularioPage'));
const LazySolicitudesUsuarioPage: LazyComponent = lazy(() => import('../pages/Usuario/Solicitudes/SolicitudesPage'));
const LazySolicitudesOperadorPage: LazyComponent = lazy(() => import('../pages/Operador/Solicitudes/SolicitudesPage'));
const LazySolicitudesAdministradorPage: LazyComponent = lazy(() => import('../pages/Administrador/Solicitudes/SolicitudesPage'));
const LazyAdministrarPage: LazyComponent = lazy(() => import('../pages/Administrador/PaginaAdministrar'));

export const PrivateRoutes: RoutesMap = [
  {
    path: '/inicio_usuario',
    public: false,
    strict: true,
    useComponent: () => <LazyInicioUsuarioPage />,
  },
  {
    path: '/inicio_operador',
    public: false,
    strict: true,
    useComponent: () => <LazyInicioOperadorPage />,
  },
  {
    path: '/inicio_administrador',
    public: false,
    strict: true,
    useComponent: () => <LazyInicioAdministradorPage />,
  },
  {
    path: '/solicitudes/formulario',
    public: false,
    strict: true,
    useComponent: () => <LazyFormularioPage />,
  },
  {
    path: '/solicitudes_usuario',
    public: false,
    strict: true,
    useComponent: () => <LazySolicitudesUsuarioPage />,
  },
  {
    path: '/solicitudes_operador',
    public: false,
    strict: true,
    useComponent: () => <LazySolicitudesOperadorPage />,
  },
  {
    path: '/solicitudes_administrador',
    public: false,
    strict: true,
    useComponent: () => <LazySolicitudesAdministradorPage />,
  },
  {
    path: '/administrar',
    public: false,
    strict: true,
    useComponent: () => <LazyAdministrarPage />,
  }
];
