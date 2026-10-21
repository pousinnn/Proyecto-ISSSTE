import {
  Create,
  SimpleForm,
  TextInput,
  PasswordInput,
  SelectInput,
  required,
  email,
  useNotify,
  useTranslate,
} from "react-admin";
import { useNavigate } from "react-router-dom";

// Ajusta los campos y los roles a lo que espera tu API (POST /api/users)
export const UserCreate = () => {
  const translate = useTranslate();
  const notify = useNotify();
  const navigate = useNavigate();

  // Misma convención que usas en el resto de la app
  const t = (key: string) => translate(`custom.${key}`);

  return (
    <Create
      title={t("users.title")}
      redirect={false}
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
        <TextInput
          source="nombre"
          label={t("users.name")}
          validate={required()}
          fullWidth
        />
        <TextInput
          source="email"
          label={t("users.email")}
          validate={[required(), email()]}
          fullWidth
        />
        <PasswordInput
          source="password"
          label={t("users.password")}
          validate={required()}
          fullWidth
        />
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
      </SimpleForm>
    </Create>
  );
};
