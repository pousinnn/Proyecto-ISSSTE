import { useMediaQuery, Theme } from "@mui/material";
import { List, SimpleList, DataTable,
    Edit, SimpleForm, ReferenceInput, TextInput, EditButton,
        Create 
 } from "react-admin";

export const ResultadosList = () => {
    const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
    return (
        <List>
            {isSmall ? (
                <SimpleList
                    primaryText={(record) => record.name}
                    secondaryText={(record) => record.username}
                    tertiaryText={(record) => record.email}
                />
            ) : (
                <DataTable>
                    <DataTable.Col source="userId" />
                    <DataTable.Col source="name" />
                    <DataTable.Col source="title" />
                    <DataTable.Col source="content" />
                    <DataTable.Col>
                    <EditButton />
                </DataTable.Col>
                </DataTable>
                
            )}
        </List>
    );
};
export const ResultadosEdit = () => (
    <Edit>
        <SimpleForm warnWhenUnsavedChanges>
            <TextInput disabled source="id" />
            <ReferenceInput source="userId" reference="users" />
            <TextInput required source ="title" />
        </SimpleForm>
    </Edit>
);

export const ResultadosCreate = () => (
    <Create>
        <SimpleForm>
            <ReferenceInput required source="userId" reference= "users" />
            <TextInput required source="title" />
        </SimpleForm>
    </Create>
);

