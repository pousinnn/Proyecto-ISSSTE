import {
  Create,
  SimpleForm,
  TextInput,
  PasswordInput,
  SelectInput,
  DateInput,
  NumberInput,
  BooleanInput,
  FormDataConsumer,
  required,
  minLength,
  maxLength,
  minValue,
  regex,
  useNotify,
  useTranslate,
} from "react-admin";
import { Box, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { OPCIONES_REGION } from "../regiones";

type DatosUsuario = {
  usuario: string;
  password: string;
  rol: string;
  nombre?: string;
  infante?: Record<string, unknown>;
};

// Crea cuentas en POST /api/users (solo admin).
// Si el rol es "paciente", también se capturan sus datos del padrón y el
// servidor crea el infante y la cuenta ligados (id_infante).
export const UserCreate = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const navigate = useNavigate();

  // Misma convención que usas en el resto de la app
  const t = (key: string, def?: string) => translate(`custom.${key}`, def ? { _: def } : undefined);

  // Solo se manda lo que corresponde al rol elegido
  const transformar = ({ usuario, password, rol, nombre, infante }: DatosUsuario) =>
    rol === "paciente"
      ? { usuario, password, rol, infante }
      : { usuario, password, rol, nombre };

  const fila = { display: "flex", gap: 2, width: "100%", flexWrap: "wrap" } as const;
  // Fecha LOCAL de hoy en AAAA-MM-DD (toISOString daría la fecha en UTC,
  // que en México por la noche ya es "mañana")
  const hoy = new Date().toLocaleDateString("en-CA");

  return (
    <Create
      title={t("users.title")}
      redirect={false}
      transform={transformar}
      mutationOptions={{
        onSuccess: () => {
          notify(t("users.notifications.created"), { type: "success" });
          navigate("/");
        },
        onError: (error) => {
          // Si el servidor explica por qué rechazó los datos, mostrar ese mensaje
          const mensaje = (error as { body?: { error?: string } })?.body?.error;
          notify(mensaje ?? t("users.notifications.error"), {
            type: "error",
          });
        },
      }}
    >
      <SimpleForm>
        <SelectInput
          source="rol"
          label={t("users.role")}
          validate={required()}
          choices={[
            { id: "admin", name: "custom.users.roles.admin" },
            { id: "doctor", name: "custom.users.roles.doctor" },
            { id: "paciente", name: "custom.users.roles.patient" },
          ]}
        />
        <TextInput
          source="usuario"
          label={t("users.username", "Usuario")}
          helperText={t("users.usernameHelp", "Con este dato inicia sesión (ej. dr.luis o una matrícula)")}
          validate={[
            required(),
            regex(/^[A-Za-z0-9._-]{3,50}$/, t("users.usernameInvalid", "De 3 a 50 caracteres: letras, números, punto, guion o guion bajo")),
          ]}
          fullWidth
        />
        <PasswordInput
          source="password"
          label={t("users.password")}
          validate={[required(), minLength(8), maxLength(128)]}
          fullWidth
        />

        <FormDataConsumer>
          {({ formData }) =>
            formData.rol === "paciente" ? (
              <Box sx={{ width: "100%" }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t("users.patientData", "Datos del padrón")}
                </Typography>

                <Box sx={fila}>
                  <TextInput source="infante.nombre" label={t("padron.firstName", "Nombre(s)")} validate={[required(), maxLength(50)]} />
                  <TextInput source="infante.paterno" label={t("padron.lastName1", "Apellido paterno")} validate={[required(), maxLength(50)]} />
                  <TextInput source="infante.materno" label={t("padron.lastName2", "Apellido materno")} validate={maxLength(50)} />
                </Box>

                <Box sx={fila}>
                  <TextInput
                    source="infante.curp"
                    label="CURP"
                    parse={(v: string) => (v ?? "").toUpperCase().trim()}
                    validate={[
                      required(),
                      regex(/^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d$/, t("padron.curpInvalid", "CURP inválido (18 caracteres)")),
                    ]}
                  />
                  <SelectInput
                    source="infante.genero"
                    label={t("padron.gender", "Género")}
                    validate={required()}
                    choices={[
                      { id: "M", name: t("common.boy", "Niño") },
                      { id: "F", name: t("common.girl", "Niña") },
                    ]}
                  />
                  <DateInput
                    source="infante.fnac"
                    label={t("padron.birthdate", "Fecha de nacimiento")}
                    validate={required()}
                    inputProps={{ max: hoy }}
                  />
                </Box>

                <Box sx={fila}>
                  <SelectInput
                    source="infante.region"
                    label={t("common.region", "Región")}
                    validate={required()}
                    choices={OPCIONES_REGION}
                  />
                  <NumberInput source="infante.ebdi" label="EBDI" validate={[required(), minValue(1)]} />
                  <TextInput source="infante.ur" label="UR" validate={maxLength(3)} />
                  <TextInput source="infante.estrato" label={t("padron.stratum", "Estrato")} validate={maxLength(2)} />
                </Box>

                <Box sx={fila}>
                  <NumberInput source="infante.matricula" label={t("padron.parentId", "Matrícula del derechohabiente")} validate={minValue(0)} />
                  <NumberInput source="infante.id_benef_infante" label={t("padron.beneficiaryId", "ID de beneficiario")} validate={minValue(0)} />
                  <DateInput
                    source="infante.freg"
                    label={t("padron.registered", "Fecha de registro")}
                    defaultValue={hoy}
                    inputProps={{ max: hoy }}
                  />
                </Box>

                <BooleanInput source="infante.discapacidad" label={t("padron.disability", "Discapacidad")} />
                {formData.infante?.discapacidad && (
                  <TextInput source="infante.grupoDisc" label={t("padron.disabilityType", "Tipo de discapacidad")} validate={maxLength(25)} />
                )}

                <TextInput
                  source="infante.comentario"
                  label={t("padron.comment", "Comentario")}
                  validate={maxLength(500)}
                  multiline
                  fullWidth
                />
              </Box>
            ) : (
              <TextInput
                source="nombre"
                label={t("users.name")}
                validate={[required(), maxLength(100)]}
                fullWidth
              />
            )
          }
        </FormDataConsumer>
      </SimpleForm>
    </Create>
  );
};
