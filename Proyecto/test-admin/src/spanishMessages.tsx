
import { TranslationMessages } from "ra-core";

const spanishMessages: TranslationMessages = {
    ra: {
        action: {
            add_filter: "Agregar filtro",
            add: "Agregar",
            back: "Regresar",
            bulk_actions:
                "1 elemento seleccionado |||| %{smart_count} elementos seleccionados",
            cancel: "Cancelar",
            clear_array_input: "Limpiar lista",
            clear_input_value: "Limpiar valor",
            clone: "Clonar",
            confirm: "Confirmar",
            create: "Crear",
            create_item: "Crear %{item}",
            delete: "Eliminar",
            edit: "Editar",
            export: "Exportar",
            list: "Lista",
            refresh: "Actualizar",
            remove_filter: "Eliminar filtro",
            remove_all_filters: "Eliminar todos los filtros",
            remove: "Eliminar",
            reset: "Restablecer",
            save: "Guardar",
            search: "Buscar",
            search_columns: "Buscar columnas",
            select_all: "Seleccionar todos",
            select_all_button: "Seleccionar todos",
            select_row: "Seleccionar fila",
            show: "Mostrar",
            sort: "Ordenar",
            undo: "Deshacer",
            unselect: "Deseleccionar",
            expand: "Expandir",
            close: "Cerrar",
            open_menu: "Abrir menu",
            close_menu: "Cerrar menu",
            update: "Actualizar",
            move_up: "Mover arriba",
            move_down: "Mover abajo",
            open: "Abrir",
            toggle_theme: "Cambiar tema claro/oscuro",
            select_columns: "Columnas",
            update_application: "Recargar aplicacion",
        },

        boolean: {
            true: "Si",
            false: "No",
            null: " ",
        },

        page: {
            create: "Crear %{name}",
            dashboard: "Panel principal",
            edit: "Editar %{name} %{recordRepresentation}",
            error: "Error",
            list: "%{name}",
            loading: "Cargando",
            not_found: "No encontrado",
            show: "Mostrar %{name} %{recordRepresentation}",
            empty: "No hay %{name} todavia.",
            invite: "Agregar nuevo",
            access_denied: "Acceso denegado",
            authentication_error: "Error de autenticacion",
        },

        input: {
            file: {
                upload_several:
                    "Arrastra archivos para subirlos o haz clic para seleccionar.",
                upload_single:
                    "Arrastra un archivo para subirlo o haz clic para seleccionarlo.",
            },

            image: {
                upload_several:
                    "Arrastra imagenes para subirlas o haz clic para seleccionar.",
                upload_single:
                    "Arrastra una imagen para subirla o haz clic para seleccionarla.",
            },

            references: {
                all_missing:
                    "No se encontraron los datos de referencia.",
                many_missing:
                    "Al menos una de las referencias asociadas no está disponible.",
                single_missing:
                    "La referencia asociada no está disponible.",
            },

            password: {
                toggle_visible: "Ocultar contraseña",
                toggle_hidden: "Mostrar contraseña",
            },
        },

        message: {
            about: "Acerca de",
            access_denied:
                "No tienes los permisos necesarios para acceder a esta pagina.",
            are_you_sure: "¿Estas seguro?",
            authentication_error:
                "El servidor de autenticación devolvio un error y no se pudieron verificar tus credenciales.",
            auth_error:
                "Ocurrio un error al validar el token de autenticacion.",
            bulk_delete_content:
                "¿Estas seguro de que deseas eliminar este %{name}? |||| ¿Estas seguro de que deseas eliminar estos %{smart_count} elementos?",
            bulk_delete_title:
                "Eliminar %{name} |||| Eliminar %{smart_count} %{name}",
            bulk_update_content:
                "¿Estas seguro de que deseas actualizar %{name} %{recordRepresentation}? |||| ¿Estas seguro de que deseas actualizar estos %{smart_count} elementos?",
            bulk_update_title:
                "Actualizar %{name} %{recordRepresentation} |||| Actualizar %{smart_count} %{name}",
            clear_array_input:
                "¿Estás seguro de que deseas limpiar toda la lista?",
            delete_content:
                "¿Estás seguro de que deseas eliminar este %{name}?",
            delete_title:
                "Eliminar %{name} %{recordRepresentation}",
            details: "Detalles",
            error:
                "Ocurrio un error del cliente y no se pudo completar tu solicitud.",
            invalid_form:
                "El formulario no es valido. Por favor, revisa los errores.",
            loading: "Por favor espera",
            no: "No",
            not_found:
                "Es posible que hayas escrito una URL incorrecta o seguido un enlace invalido.",
            select_all_limit_reached:
                "Hay demasiados elementos para seleccionarlos todos. Solo se seleccionaron los primeros %{max}.",
            unsaved_changes:
                "Algunos de tus cambios no se guardaron. ¿Estás seguro de que deseas ignorarlos?",
            yes: "Sí",
            placeholder_data_warning:
                "Problema de red: no se pudieron actualizar los datos.",
        },

        navigation: {
            clear_filters: "Limpiar filtros",
            no_filtered_results:
                "No se encontraron %{name} utilizando los filtros actuales.",
            no_results: "No se encontraron %{name}",
            no_more_results:
                "El numero de pagina %{page} esta fuera de los limites. Intenta con la pagina anterior.",
            page_out_of_boundaries:
                "El numero de pagina %{page} esta fuera de los limites.",
            page_out_from_end:
                "No puedes avanzar después de la última pagina.",
            page_out_from_begin:
                "No puedes retroceder antes de la pagina 1.",
            page_range_info:
                "%{offsetBegin}-%{offsetEnd} de %{total}",
            partial_page_range_info:
                "%{offsetBegin}-%{offsetEnd} de más de %{offsetEnd}",
            current_page: "Pagina %{page}",
            page: "Ir a la pagina %{page}",
            first: "Ir a la primera pagina",
            last: "Ir a la última pagina",
            next: "Ir a la siguiente pagina",
            previous: "Ir a la pagina anterior",
            page_rows_per_page: "Filas por pagina:",
            skip_nav: "Ir al contenido",
        },

        sort: {
            sort_by: "Ordenar por %{field_lower_first} %{order}",
            ASC: "ascendente",
            DESC: "descendente",
        },

        auth: {
            auth_check_error: "Inicia sesion para continuar",
            user_menu: "Perfil",
            username: "Usuario",
            password: "Contraseña",
            email: "Correo pagielectronicona",
            sign_in: "Iniciar sesión",
            sign_in_error:
                "La autenticación falló, por favor inténtalo nuevamente",
            logout: "Cerrar sesión",
        },

        notification: {
            updated:
                "Elemento actualizado |||| %{smart_count} elementos actualizados",
            created: "Elemento creado",
            deleted:
                "Elemento eliminado |||| %{smart_count} elementos eliminados",
            bad_item: "Elemento incorrecto",
            item_doesnt_exist: "El elemento no existe",
            http_error: "Error de comunicación con el servidor",
            data_provider_error:
                "Error del proveedor de datos. Revisa la consola para obtener más información.",
            i18n_error:
                "No se pudieron cargar las traducciones para el idioma seleccionado.",
            canceled: "Acción cancelada",
            logged_out:
                "Tu sesión ha terminado. Por favor, vuelve a iniciar sesión.",
            not_authorized:
                "No tienes autorización para acceder a este recurso.",
            application_update_available:
                "Hay una nueva versión disponible.",
            offline:
                "Sin conexión. No se pudieron obtener los datos.",
        },

        validation: {
            required: "Campo obligatorio",
            minLength:
                "Debe tener al menos %{min} caracteres",
            maxLength:
                "Debe tener %{max} caracteres o menos",
            minValue:
                "Debe ser como mínimo %{min}",
            maxValue:
                "Debe ser %{max} o menor",
            number: "Debe ser un número",
            email: "Debe ser un correo electronico válido",
            oneOf: "Debe ser uno de: %{options}",
            regex:
                "Debe coincidir con un formato específico (expresión regular): %{pattern}",
            unique: "Debe ser único",
        },

        saved_queries: {
            label: "Consultas guardadas",
            query_name: "Nombre de la consulta",
            new_label: "Guardar consulta actual...",
            new_dialog_title: "Guardar consulta actual como",
            remove_label: "Eliminar consulta guardada",
            remove_label_with_name:
                'Eliminar consulta "%{name}"',
            remove_dialog_title:
                "¿Eliminar consulta guardada?",
            remove_message:
                "¿Estás seguro de que deseas eliminar este elemento de tus consultas guardadas?",
            help:
                "Filtra la lista y guarda esta consulta para utilizarla después",
        },
        

        guesser: {
            empty: {
                title: "No hay datos para mostrar",
                message:
                    "Por favor, revisa tu proveedor de datos",
            },
        },

        configurable: {
            customize: "Personalizar",
            configureMode: "Configurar esta pagina",

            inspector: {
                title: "Inspector",
                content:
                    "Pasa el cursor sobre los elementos de la interfaz para configurarlos",
                reset: "Restablecer configuración",
                hideAll: "Ocultar todo",
                showAll: "Mostrar todo",
            },

            Datagrid: {
                title: "Tabla de datos",
                unlabeled: "Columna sin etiqueta #%{column}",
            },

            SimpleForm: {
                title: "Formulario",
                unlabeled: "Campo sin etiqueta #%{input}",
            },

            SimpleList: {
                title: "Lista",
                primaryText: "Texto principal",
                secondaryText: "Texto secundario",
                tertiaryText: "Texto terciario",
            },
        },
    },

    resources: {
        users: {
            name: "Usuario |||| Usuarios",
            fields: {
                id: "ID",
                name: "Nombre",
                username: "Usuario",
                email: "Correo electronico",
                phone: "Teléfono",
                website: "Sitio web",
            },
        },
        posts: {
            name: "Publicacion |||| Publicaciones",
            fields: {
                id: "ID",
                userId: "Usuario",
                title: "Título",
                body: "Contenido",
            },
        },

        comments: {
            name: "Comentario |||| Comentarios",
            fields: {
                id: "ID",
                postId: "Publicacion",
                name: "Nombre",
                email: "Correo electronico",
                body: "Comentario",
            },
        },

        albums: {
            name: "Album |||| Albumes",
            fields: {
                id: "ID",
                userId: "Usuario",
                title: "Título",
            },
        },

        photos: {
            name: "Foto |||| Fotos",
            fields: {
                id: "ID",
                albumId: "Album",
                title: "Titulo",
                url: "URL",
                thumbnailUrl: "Miniatura",
            },
        },

        todos: {
            name: "Tarea |||| Tareas",
            fields: {
                id: "ID",
                userId: "Usuario",
                title: "Titulo",
                completed: "Completada",
            },
        },
        resultados: {
            name: "Resultados",
        },
        pesoytalla: {
            name: "Peso y Talla",
        },
        tallablanca: {
            name: "Talla Blanco",
        },
        perimetrocefalico: {
            name: "Perímetro Cefálico",
        },
    },
    custom: {
        dashboard: {
    welcome: "Bienvenido, %{name}",
        loading: "Cargando usuario...",
        error: "Error al obtener usuario",
        adminTitle: "Bienvenido a la administración",
        adminDescription: "Panel de administración",
        userId: "ID: %{id}",
    },

    resources: {
      resultados: "Resultados",
      pesoytalla: "Peso y Talla",
      tallablanca: "Talla Blanco",
      perimetrocefalico: "Perímetro Cefálico",
    },

    common: {
      instructions: "Instrucciones",
      sex: "Sexo",
      boy: "Niño",
      girl: "Niña",
      period: "Periodo",
      zone: "EBDI / Zona",
      unit: "Unidad",
      quantity: "Cantidad",
      save: "Guardar",
      calculate: "Calcular",
      convert: "Convertir",
      search: "Buscar",
    },

    pesoytalla: {
      title: "Calculadora Peso & Talla",
      birthdate: "Fecha de nacimiento",
      height: "Altura",
      weight: "Peso",
      age: "Edad",
      bmi: "IMC",
      description:
        "Selecciona el sexo, la fecha de nacimiento y registra el peso y la altura.",
    },

    tallablanca: {
      title: "Calculadora Talla Blanco",
      fatherHeight: "Altura padre",
      motherHeight: "Altura madre",
      result: "Talla blanco familiar",
      description:
        "Ingresa la altura del padre y de la madre.",
    },

    perimetrocefalico: {
      title: "Calculadora Perímetro Cefálico",
      perimeter: "Perímetro",
      result: "Perímetro cefálico",
      description:
        "Selecciona el sexo e ingresa el perímetro cefálico.",
    },

    resultados: {
      title: "Resultados",
      history: "Historial",
      nutritionHistory: "Historial Nutrición",
      name: "Nombre",
      titleColumn: "Título",
      content: "Contenido",
      date: "Fecha",
    },

    notifications: {
      saved: "Registro guardado correctamente",
      error: "Error al guardar el registro",
      required: "Completa los campos obligatorios",
      calculated: "Cálculo realizado correctamente",
      invalidMeasurement: "Ingresa una medida válida",
    },
  },
};

export default spanishMessages;