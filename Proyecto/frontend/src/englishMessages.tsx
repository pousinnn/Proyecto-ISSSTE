import { TranslationMessages } from "ra-core";

const englishMessages: TranslationMessages = {
    ra: {
        action: {
            add_filter: "Add filter",
            add: "Add",
            back: "Go back",
            bulk_actions:
                "1 item selected |||| %{smart_count} items selected",
            cancel: "Cancel",
            clear_array_input: "Clear list",
            clear_input_value: "Clear value",
            clone: "Clone",
            confirm: "Confirm",
            create: "Create",
            create_item: "Create %{item}",
            delete: "Delete",
            edit: "Edit",
            export: "Export",
            list: "List",
            refresh: "Refresh",
            remove_filter: "Remove filter",
            remove_all_filters: "Remove all filters",
            remove: "Remove",
            reset: "Reset",
            save: "Save",
            search: "Search",
            search_columns: "Search columns",
            select_all: "Select all",
            select_all_button: "Select all",
            select_row: "Select row",
            show: "Show",
            sort: "Sort",
            undo: "Undo",
            unselect: "Unselect",
            expand: "Expand",
            close: "Close",
            open_menu: "Open menu",
            close_menu: "Close menu",
            update: "Update",
            move_up: "Move up",
            move_down: "Move down",
            open: "Open",
            toggle_theme: "Toggle light/dark theme",
            select_columns: "Columns",
            update_application: "Reload application",
        },

        boolean: {
            true: "Yes",
            false: "No",
            null: " ",
        },

        page: {
            create: "Create %{name}",
            dashboard: "Dashboard",
            edit: "Edit %{name} %{recordRepresentation}",
            error: "Error",
            list: "%{name}",
            loading: "Loading",
            not_found: "Not found",
            show: "Show %{name} %{recordRepresentation}",
            empty: "No %{name} yet.",
            invite: "Add new",
            access_denied: "Access denied",
            authentication_error: "Authentication error",
        },

        input: {
            file: {
                upload_several:
                    "Drag files to upload them or click to select.",
                upload_single:
                    "Drag a file to upload it or click to select it.",
            },

            image: {
                upload_several:
                    "Drag images to upload them or click to select.",
                upload_single:
                    "Drag an image to upload it or click to select it.",
            },

            references: {
                all_missing: "No reference data found.",
                many_missing:
                    "At least one of the associated references is unavailable.",
                single_missing:
                    "The associated reference is unavailable.",
            },

            password: {
                toggle_visible: "Hide password",
                toggle_hidden: "Show password",
            },
        },

        message: {
            about: "About",

            access_denied:
                "You do not have the necessary permissions to access this page.",

            are_you_sure: "Are you sure?",

            authentication_error:
                "The authentication server returned an error and your credentials could not be verified.",

            auth_error:
                "An error occurred while validating the authentication token.",

            bulk_delete_content:
                "Are you sure you want to delete this %{name}? |||| Are you sure you want to delete these %{smart_count} items?",

            bulk_delete_title:
                "Delete %{name} |||| Delete %{smart_count} %{name}",

            bulk_update_content:
                "Are you sure you want to update %{name} %{recordRepresentation}? |||| Are you sure you want to update these %{smart_count} items?",

            bulk_update_title:
                "Update %{name} %{recordRepresentation} |||| Update %{smart_count} %{name}",

            clear_array_input:
                "Are you sure you want to clear the entire list?",

            delete_content:
                "Are you sure you want to delete this %{name}?",

            delete_title:
                "Delete %{name} %{recordRepresentation}",

            details: "Details",

            error:
                "A client error occurred and your request could not be completed.",

            invalid_form:
                "The form is not valid. Please check the errors.",

            loading: "Please wait",

            no: "No",

            not_found:
                "You may have entered an incorrect URL or followed an invalid link.",

            select_all_limit_reached:
                "There are too many items to select them all. Only the first %{max} were selected.",

            unsaved_changes:
                "Some of your changes were not saved. Are you sure you want to ignore them?",

            yes: "Yes",

            placeholder_data_warning:
                "Network problem: the data could not be updated.",
        },

        navigation: {
            clear_filters: "Clear filters",

            no_filtered_results:
                "No %{name} were found using the current filters.",

            no_results: "No %{name} found",

            no_more_results:
                "Page %{page} is out of bounds. Try the previous page.",

            page_out_of_boundaries:
                "Page %{page} is out of bounds.",

            page_out_from_end:
                "You cannot go beyond the last page.",

            page_out_from_begin:
                "You cannot go before page 1.",

            page_range_info:
                "%{offsetBegin}-%{offsetEnd} of %{total}",

            partial_page_range_info:
                "%{offsetBegin}-%{offsetEnd} of more than %{offsetEnd}",

            current_page: "Page %{page}",

            page: "Go to page %{page}",

            first: "Go to first page",

            last: "Go to last page",

            next: "Go to next page",

            previous: "Go to previous page",

            page_rows_per_page: "Rows per page:",

            skip_nav: "Skip to content",
        },

        sort: {
            sort_by:
                "Sort by %{field_lower_first} %{order}",
            ASC: "ascending",
            DESC: "descending",
        },

        auth: {
            auth_check_error: "Please log in to continue",
            user_menu: "Profile",
            username: "Username",
            password: "Password",
            email: "Email",
            sign_in: "Sign in",
            sign_in_error:
                "Authentication failed, please try again",
            logout: "Log out",
        },

        notification: {
            updated:
                "Element updated |||| %{smart_count} elements updated",

            created: "Element created",

            deleted:
                "Element deleted |||| %{smart_count} elements deleted",

            bad_item: "Incorrect element",

            item_doesnt_exist: "The element does not exist",

            http_error:
                "Server communication error",

            data_provider_error:
                "Data provider error. Check the console for more information.",

            i18n_error:
                "The translations for the selected language could not be loaded.",

            canceled: "Action canceled",

            logged_out:
                "Your session has ended. Please log in again.",

            not_authorized:
                "You are not authorized to access this resource.",

            application_update_available:
                "A new version is available.",

            offline:
                "No connection. The data could not be retrieved.",
        },

        saved_queries: {
            label: "Saved queries",
            query_name: "Query name",
            new_label: "Save current query...",
            new_dialog_title: "Save current query as",
            remove_label: "Delete saved query",
            remove_label_with_name:
                'Delete query "%{name}"',
            remove_dialog_title: "Delete saved query?",
            remove_message:
                "Are you sure you want to delete this item from your saved queries?",
            help:
                "Filter the list and save this query for later",
        },

        validation: {
            required: "Required",

            minLength:
                "Must be at least %{min} characters",

            maxLength:
                "Must be %{max} characters or less",

            minValue:
                "Must be at least %{min}",

            maxValue:
                "Must be %{max} or less",

            number: "Must be a number",

            email:
                "Must be a valid email address",

            oneOf:
                "Must be one of: %{options}",

            regex:
                "Must match a specific format: %{pattern}",

            unique: "Must be unique",
        },
    },

    resources: {
        users: {
            name: "User |||| Users",

            fields: {
                id: "ID",
                name: "Name",
                username: "Username",
                email: "Email",
                phone: "Phone",
                website: "Website",
            },
        },

        posts: {
            name: "Post |||| Posts",

            fields: {
                id: "ID",
                userId: "User",
                title: "Title",
                body: "Content",
            },
        },

        comments: {
            name: "Comment |||| Comments",

            fields: {
                id: "ID",
                postId: "Post",
                name: "Name",
                email: "Email",
                body: "Comment",
            },
        },

        albums: {
            name: "Album |||| Albums",

            fields: {
                id: "ID",
                userId: "User",
                title: "Title",
            },
        },

        photos: {
            name: "Photo |||| Photos",

            fields: {
                id: "ID",
                albumId: "Album",
                title: "Title",
                url: "URL",
                thumbnailUrl: "Thumbnail",
            },
        },
        historial: {
            name: "History",
        },

        todos: {
            name: "To Do |||| To Do",

            fields: {
                id: "ID",
                userId: "User",
                title: "Title",
                completed: "Completed",
            },
        },
        resultados: {
            name: "Results",
        },
        pesoytalla: {
            name: "Weight and Height",
        },
        tallablanca: {
            name: "Target Height",
        },
        perimetrocefalico: {
            name: "Head Circumference",
        },
        infantes: {
            name: "Registry",
        },
    },
    custom: {
    dashboard: {
        welcome: "Welcome, %{name}",
        loading: "Loading user...",
        error: "Error loading user",
        adminTitle: "Welcome to the administration",
        adminDescription: "Administration dashboard",
        userId: "ID: %{id}",
    },
    resources: {
      resultados: "Results",
      pesoytalla: "Weight and Height",
      tallablanca: "Target Height",
      perimetrocefalico: "Head Circumference",
    },
    
    common: {
      instructions: "Instructions",
      sex: "Sex",
      boy: "Boy",
      girl: "Girl",
      period: "Period",
      zone: "EBDI / Zone",
      patient: "Patient",
      selectPatient: "Select a patient",
      region: "Region",
      selectRegion: "Select a region",
      doctorRegion: "Your assigned region",
      allRegions: "All",
      unit: "Unit",
      quantity: "Quantity",
      save: "Save",
      calculate: "Calculate",
      convert: "Convert",
      search: "Search",
    },

    pesoytalla: {
      title: "Weight & Height Calculator",
      birthdate: "Date of Birth",
      height: "Height",
      weight: "Weight",
      age: "Age",
      bmi: "BMI",
      description:
        "Select the sex and date of birth, then enter the weight and height.",
    },

    tallablanca: {
      title: "Target Height Calculator",
      fatherHeight: "Father's Height",
      motherHeight: "Mother's Height",
      result: "Mid-Parental Target Height",
      description:
        "Enter the father's and mother's heights.",
    },

    perimetrocefalico: {
      title: "Head Circumference Calculator",
      perimeter: "Circumference",
      result: "Head Circumference",
      description:
        "Select the sex and enter the head circumference.",
    },

    resultados: {
      title: "Results",
      history: "History",
      nutritionHistory: "Nutrition History",
      name: "Name",
      titleColumn: "Title",
      content: "Content",
      date: "Date",
    },
    
    historial: {
        title: "Record History",
        name: "Name",
        type: "Type",
        date: "Date",
        result: "Result",
        actions: "Actions",
        view: "View",
        details: "Record Details",
    },
    users: {
        new: "New user",
        title: "Create user",
        name: "Name",
        email: "Email",
        username: "Username",
        usernameHelp: "Used to sign in (e.g. dr.luis or an ID number)",
        usernameInvalid: "3 to 50 characters: letters, numbers, dot, dash or underscore",
        patientData: "Registry data",
        doctorRegionHelp: "The doctor will only see patients from this region",
        password: "Password",
        role: "Role",
        roles: {
            admin: "Administrator",
            doctor: "Doctor",
            patient: "Patient",
        },
        notifications: {
            created: "User created successfully",
            error: "The user could not be created",
        },
    },
    
    notifications: {
      saved: "Record saved successfully",
      error: "Error saving the record",
      required: "Complete the required fields",
      calculated: "Calculation completed successfully",
      invalidMeasurement: "Enter a valid measurement",
    },
  },
};

export default englishMessages;