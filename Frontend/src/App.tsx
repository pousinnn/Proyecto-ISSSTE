import { Admin, Resource, CustomRoutes} from "react-admin";
import { Layout } from "./Layout";
import {Route} from  "react-router-dom";
import {listarProductos, editarProductos, crearProductos} from "./Productos";
import {dataProvider} from "./dataProvider";
import Registro from "./registrarse";
import authProvider from "./Authprovider";

export const App = () => (
<Admin layout={Layout} dataProvider={dataProvider} authProvider={authProvider}>
<Resource
    name="Productos"
    list={listarProductos}
    edit={editarProductos}
    create={crearProductos}
 />
 <CustomRoutes>
    <Route path="/registrarse" element={<Registro />}/>
 </CustomRoutes>
</Admin>

);