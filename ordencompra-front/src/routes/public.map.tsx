import { LazyComponent, RoutesMap } from '@/types';
import { lazy } from 'react';

const LazySignIn: LazyComponent = lazy(() => import('../pages/Usuario/LoginPage'));
const LazySolicitarCuentaPage: LazyComponent = lazy(() => import('../pages/Usuario/SolicitarCuentaPage'));

export const PublicRoutes: RoutesMap = [
  {
    path: '/login',
    public: true,
    strict: true,
    useComponent: () => <LazySignIn/>,
    symlinks: [
      '/',
    ],
  },
  {
    path: '/solicitar_cuenta',
    public: true,
    strict: true,
    useComponent: () => <LazySolicitarCuentaPage/>
  }
];
