import { Box, Button, Tooltip } from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { useCreatePath, usePermissions, useTranslate } from "react-admin";
import { useNavigate } from "react-router-dom";

//Boton para crear un usuario nuevo, solo lo ve el admin
export const BotonNuevoUsuario = () => {
  const navigate = useNavigate();
  const createPath = useCreatePath();
  const translate = useTranslate();
  //Revisa el rol del usuario
  const { permissions } = usePermissions();

  if (permissions !== "admin") return null;

  const etiqueta = translate("custom.users.new", { _: "Nuevo usuario" });

  return (
    <Tooltip title={etiqueta}>
      <Button
        color="inherit"
        startIcon={<PersonAdd />}
        onClick={() =>
          navigate(createPath({ resource: "users", type: "create" }))
        }
        sx={{ textTransform: "none", fontWeight: 600 }}
      >
        {/* En pantallas chicas solo se ve el ícono */}
        <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
          {etiqueta}
        </Box>
      </Button>
    </Tooltip>
  );
};
