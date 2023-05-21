import './App.css';
import {SnackbarProvider} from 'mui-wrapped-components';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {getRouterConfig} from "./routes";


function App() {

  const router = createBrowserRouter(getRouterConfig());

  return (
    <SnackbarProvider>
      <RouterProvider router={router} />
    </SnackbarProvider>
  );
}

export default App;
