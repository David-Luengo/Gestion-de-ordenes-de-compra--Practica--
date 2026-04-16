import React, { useState, useEffect, Suspense } from "react";
import { Navigate, Route, RouteObject, Routes } from "react-router";
import { notFoundRouteWildcard } from "./routes/map";
import { BrowserRouter } from "react-router-dom";
import { Routes as RoutesMap } from "./routes/map";
import { SessionProvider } from "./providers/session.provider";
import { IsolatedComponent, RouteConfig } from "./types";
import axios from "axios";
import {obtenerRolUsuario } from "./funcionesTS/obtenerIdUsuario";

const AppRouter: IsolatedComponent = () => {
  const [routesConfigs, setRoutesConfigs] = useState<RouteConfig[]>([]);
  const [routes, setRoutes] = useState<RouteObject[]>([]);

  const getParentAndChildrenRoutes = (
    routeConfig: RouteConfig
  ): RouteConfig[] => {
    const routeConfigList = [routeConfig];
    if (routeConfig.childRoutes) {
      routeConfig.childRoutes
        .map((childRoute) => getParentAndChildrenRoutes(childRoute))
        .forEach((routeSubMap) => {
          routeSubMap.forEach((route) => {
            route.path = routeConfig.path.concat(route.path);
            routeConfigList.push(route);
          });
        });
    }
    return routeConfigList;
  };

  const getRoutesAndRedirects = async () => {
    const $routes: RouteObject[] = [];
    for (const config of routesConfigs) {
      if (config.useComponent) {
        const route: RouteObject = {
          path: config.path,
          caseSensitive: false,
          element: (
            <Suspense fallback={null}>{config.useComponent() as any}</Suspense>
          ),
        };
        if (config.strict) {
          if (config.public && SessionProvider.isAuthenticated()) {
            const token = sessionStorage.getItem("session_token");
            let verificado = false;
            try {
              await axios.post("/token/verify/", { token });

              verificado = true

            } catch (err: any) {

            }

            if (verificado) {
              const rol:any = await obtenerRolUsuario();

              if (rol === 'Solicitante') {
                route.element = <Navigate to="/inicio_usuario"/>;
              }
              if (rol === 'Operador') {
                route.element = <Navigate to="/inicio_operador"/>;
              }
              if (rol === 'Administrador') {
                route.element = <Navigate to="/inicio_administrador"/>;
              }

            } else {
              sessionStorage.removeItem('session_token');
            }

          } else if (!config.public && !SessionProvider.isAuthenticated()) {
            route.element = <Navigate to="/login" />;
          }

        }
        $routes.push(route);
        config.symlinks?.forEach((symlink) => {
          $routes.push({
            path: symlink,
            caseSensitive: false,
            element: <Navigate replace to={config.path} />,
          });
        });
      }
    }
    return $routes;
  };

  useEffect(() => {
    const $routesConfigs: RouteConfig[] = [];
    RoutesMap.forEach((mapper: any) => {
      getParentAndChildrenRoutes(mapper).forEach((route) => {
        $routesConfigs.push(route);
      });
    });
    setRoutesConfigs($routesConfigs);
  }, []);

  useEffect(() => {
    const updateRoutes = async () => {
      const updatedRoutes = await getRoutesAndRedirects();
      setRoutes(updatedRoutes);
    };

    updateRoutes();
  }, [routesConfigs]);

  return (
    <BrowserRouter basename={"/"}>
      <Routes>
        {routes.map((route, key) => (
          <Route
            {...(route as any)}
            element={route.element as any}
            key={key as any}
          />
        ))}
        {/* Default route */}
        <Route
          path={notFoundRouteWildcard.path}
          element={notFoundRouteWildcard.useComponent() as any}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
