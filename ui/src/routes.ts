

export interface Route {
    path: string;
    name: string;
}

export enum RouteType {
    startPage='startPage',
    servicePage='servicePage',
    cameraPage='cameraPage'
}

export type AppRoutes = Partial<Record<keyof typeof RouteType, Route>>;

export const routes: AppRoutes = {
    startPage: {
        path: '/',
        name: 'Startpage',
    },
    servicePage: {
        path: '/accessories',
        name: 'Accessories'
    },
    cameraPage: {
        path: '/cameras',
        name: 'Cameras'
    }
};
