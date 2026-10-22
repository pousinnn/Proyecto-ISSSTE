import { Admin, Resource} from "react-admin";
import { dataProvider } from "./dataProvider";
import { authProvider} from "./authProvider";



import spanishMessages from "./spanishMessages";
import englishMessages from "./englishMessages";
import polyglotI18nProvider from "ra-i18n-polyglot";
import MyLayout from './MyLayout';


//LOGIN
//import MyLoginPage from './MyLoginPage';

//BOTON NUEVO USUARIO
import { UserCreate } from "./usuarios/UserCreate";


//RESULTADOS
import { Resultados } from "./resultados/Resultados";
import { Assessment } from "@mui/icons-material";

//PESO Y TALLA
import { MonitorWeight } from "@mui/icons-material";
import { PesoYTalla } from "./pesoytalla/pesoytalla";

//TALLA BLANCA
import { TallaBlanca } from "./tallablanca/TallaBlanca";
import { Height } from "@mui/icons-material";

//PERIMETRO CEFALICO
import { PerimetroCefalico } from "./perimetrocefalico/PerimetroCefalico";
import { Straighten } from "@mui/icons-material";

//PADRON
import { PadronList, PadronShow } from "./padron/Padron";
import { ChildCare } from "@mui/icons-material";

//HISTORIAL
import { Historial } from "./historial/Historial";
import { History } from "@mui/icons-material";

//HISTORIAL NUTRICION
import { HistorialNutricion } from "./historialnutricion/HistorialNutricion";
import { Restaurant } from "@mui/icons-material";

//Cambia el idioma entre español e ingles
const i18nProvider = polyglotI18nProvider(
    (locale) => {
        if (locale === "en") {
            return englishMessages;
        }

        return spanishMessages;
    },
    "es",
    [
        { locale: "es", name: "Español" },
        { locale: "en", name: "English" },
    ]
);


//Aplicacion principal con todas las paginas
export const App = () =>(
    <Admin layout = {MyLayout}
    //loginPage = {MyLoginPage} 
    dataProvider = {dataProvider}
    authProvider={authProvider}
    //dashboard={Dashboard}
    i18nProvider={i18nProvider}>
        {/* El menú cambia según el rol (el servidor también lo revisa) */}
        {(permissions: string) => [
            //USUARIOS
            <Resource key="users" name="users" create={UserCreate} />,
            //RESULTADOS
            <Resource key="resultados" name="resultados" list={Resultados} icon={Assessment} />,

            //CAPTURA: el coordinador regional solo consulta, no captura
            ...(permissions !== "coordinador"
                ? [
                      //PESO Y TALLA
                      <Resource key="pesoytalla" name="pesoytalla" list={PesoYTalla} icon={MonitorWeight} />,
                      //TALLA BLANCA
                      <Resource key="tallablanca" name="tallablanca" list={TallaBlanca} icon={Height} />,
                      //PERIMETRO CEFALICO
                      <Resource key="perimetrocefalico" name="perimetrocefalico" list={PerimetroCefalico} icon={Straighten} />,
                  ]
                : []),

            //HISTORIAL
            <Resource key="historial" name="historial" list={Historial} icon={History} />,

            //HISTORIAL NUTRICION
            <Resource key="historialnutricion" name="historialnutricion" list={HistorialNutricion} icon={Restaurant} />,

            //PADRON: admin, coordinador (su región) y estancia (su EBDI)
            ...(["admin", "coordinador", "estancia"].includes(permissions)
                ? [<Resource key="infantes" name="infantes" list={PadronList} show={PadronShow} icon={ChildCare} />]
                : []),
        ]}
    </Admin>
);
