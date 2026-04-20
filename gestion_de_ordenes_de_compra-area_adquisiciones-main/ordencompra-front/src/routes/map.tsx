import { RouteConfig, RoutesMap } from '@/types';
import { PrivateRoutes } from '@routes/private.map';
import { PublicRoutes } from '@routes/public.map';
// import { SessionProvider } from '../providers/session.provider';
// import NotFound from './pages/errors/not-found';

export const notFoundRouteWildcard: Required<Pick<RouteConfig, 'path' | 'public' | 'useComponent'>> = {
  path: '*',
  public: true,
  useComponent: () => <>{}</>,
};

export const Routes: RoutesMap = [
  ...PublicRoutes,
  ...PrivateRoutes,
];

export default Routes;
