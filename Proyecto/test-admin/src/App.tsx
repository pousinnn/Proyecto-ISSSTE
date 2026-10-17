import { Admin, Resource} from "react-admin";
import { dataProvider } from "./dataProvider";
import { authProvider} from "./authProvider";
import { Dashboard } from "./Dashboard";


import spanishMessages from "./spanishMessages";
import englishMessages from "./englishMessages";
import polyglotI18nProvider from "ra-i18n-polyglot";
import MyLayout from './MyLayout';

//GetIdentity

//LOGIN
//import MyLoginPage from './MyLoginPage';


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


export const App = () =>(
    <Admin layout = {MyLayout}
    //loginPage = {MyLoginPage} 
    dataProvider = {dataProvider}
    authProvider={authProvider}
    dashboard={Dashboard}
    i18nProvider={i18nProvider}>
        //RESULTADOS
        <Resource name="resultados" list={Resultados} icon={Assessment} />

        //PESO Y TALLA
        <Resource name="pesoytalla" list={PesoYTalla} icon={MonitorWeight} />
        
        //TALLA BLANCA
        <Resource name="tallablanca" list={TallaBlanca} icon={Height}/>

        //PERIMETRO CEFALICO
        <Resource name="perimetrocefalico" list={PerimetroCefalico} icon={Straighten} />
    </Admin>
);
