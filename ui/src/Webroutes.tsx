import {Route, routes, RouteType} from './routes';
import ServicePage from './pages/ServicePage';
import {Lightbulb} from '@mui/icons-material';
import {RouteObject} from 'react-router-dom';
import StartPage from './pages/StartPage';

export interface FrontendRoute extends Route {
    element: JSX.Element;
    icon: JSX.Element;
}

export type FrontendRoutes = Partial<Record<keyof typeof RouteType, FrontendRoute>>;

export const frontendRoutes: FrontendRoutes = {
  startPage: {
    ...routes.startPage!,
    element: <StartPage />,
    icon: <div />,
  },
  servicePage: {
    ...routes.servicePage!,
    element: <ServicePage />,
    icon: <Lightbulb />,
  },
};

export const getRouterConfig = (): RouteObject[] => {
  return Object.values(frontendRoutes).map((route) => ({
    path: route.path,
    element: route.element,
  }));
};
