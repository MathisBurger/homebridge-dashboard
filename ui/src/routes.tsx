import ServicePage from "./pages/ServicePage";
import {Lightbulb} from "@mui/icons-material";
import {RouteObject} from "react-router-dom";

export interface Route {
    path: string;
    name: string;
    component: JSX.Element;
    icon: JSX.Element;
}

export const routes: Route[] = [
    {
        path: '/start',
        name: 'Startpage',
        component: <ServicePage />,
        icon: <Lightbulb />
    }
];

export const getRouterConfig = (): RouteObject[] => {
    return routes.map((route) => ({
      path: route.path,
        element: route.component
    }));
}
