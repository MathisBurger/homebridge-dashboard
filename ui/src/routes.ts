

export interface Route {
    path: string;
    name: string;
}

export enum RouteType {
    startPage
}

export type AppRoutes = Partial<Record<keyof typeof RouteType, Route>>;

export const routes: AppRoutes = {
    startPage: {
        path: '/',
        name: 'Startpage',
    }
};
