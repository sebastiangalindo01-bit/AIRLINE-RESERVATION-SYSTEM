const form = document.getElementById("forCliente");

if (form) {
    const fields = {
        tipo_documento: document.getElementById("tipo_documento"),
        numero_identificacion: document.getElementById("numero_identificacion"),
        nombre: document.getElementById("nombre"),
        apellido: document.getElementById("apellido"),
        email: document.getElementById("email"),
        telefono: document.getElementById("telefono"),
        telefono_alterno: document.getElementById("telefono_alterno"),
        password: document.getElementById("password"),
        confirm_password: document.getElementById("confirm_password"),
        direccion_residencia: document.getElementById("direccion_residencia"),
        pais: document.getElementById("pais"),
        departamento_estado: document.getElementById("departamento_estado"),
        ciudad: document.getElementById("ciudad")
    };

    const rules = {
        tipo_documento(value) {
            return value ? "" : "Selecciona un tipo de documento.";
        },
        numero_identificacion(value) {
            const tipo = fields.tipo_documento.value;
            if (!value) return "Ingresa el numero de identificacion.";

            if (tipo === "Cedula") {
                if (!/^\d{6,10}$/.test(value)) {
                    return "La cedula debe tener entre 6 y 10 digitos numericos.";
                }
                return "";
            }

            if (tipo === "Pasaporte") {
                if (!/^[A-Za-z0-9]{6,12}$/.test(value)) {
                    return "El pasaporte debe tener entre 6 y 12 caracteres alfanumericos.";
                }
                return "";
            }

            return /^\d{6,12}$/.test(value)
                ? ""
                : "El numero de identificacion debe tener entre 6 y 12 digitos.";
        },
        nombre(value) {
            if (!value) return "Ingresa tus nombres.";
            return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,60}$/.test(value)
                ? ""
                : "Los nombres solo admiten letras y espacios (2-60 caracteres).";
        },
        apellido(value) {
            if (!value) return "Ingresa tus apellidos.";
            return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,60}$/.test(value)
                ? ""
                : "Los apellidos solo admiten letras y espacios (2-60 caracteres).";
        },
        email(value) {
            if (!value) return "Ingresa un correo electronico.";
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
                ? ""
                : "Ingresa un correo electronico valido.";
        },
        telefono(value) {
            if (!value) return "Ingresa un numero de telefono.";
            return /^\d{7,15}$/.test(value)
                ? ""
                : "El telefono debe contener entre 7 y 15 digitos.";
        },
        telefono_alterno(value) {
            if (!value) return "";
            return /^\d{7,15}$/.test(value)
                ? ""
                : "El telefono alterno debe contener entre 7 y 15 digitos.";
        },
        password(value) {
            if (!value) return "Ingresa una contrasena.";
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value)
                ? ""
                : "La contrasena debe tener minimo 8 caracteres, mayuscula, minuscula, numero y simbolo.";
        },
        confirm_password(value) {
            if (!value) return "Confirma la contrasena.";
            return value === fields.password.value ? "" : "Las contrasenas no coinciden.";
        },
        direccion_residencia(value) {
            if (!value) return "Ingresa la direccion de residencia.";
            return value.length >= 5 ? "" : "La direccion debe tener al menos 5 caracteres.";
        },
        pais(value) {
            return value ? "" : "Selecciona un pais.";
        },
        departamento_estado(value) {
            return value ? "" : "Selecciona un departamento o estado.";
        },
        ciudad(value) {
            if (!value) return "Ingresa la ciudad.";
            return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,60}$/.test(value)
                ? ""
                : "La ciudad solo admite letras y espacios (2-60 caracteres).";
        }
    };

    const getFieldValue = (field) => field.value.trim();

    const setFieldState = (field, message) => {
        field.setCustomValidity(message);
        field.classList.toggle("is-invalid", Boolean(message));
        field.setAttribute("aria-invalid", message ? "true" : "false");
    };

    const validateField = (fieldName) => {
        const field = fields[fieldName];
        if (!field || !rules[fieldName]) return true;

        const message = rules[fieldName](getFieldValue(field));
        setFieldState(field, message);
        return !message;
    };

    form.setAttribute("novalidate", "novalidate");

    Object.keys(fields).forEach((fieldName) => {
        const field = fields[fieldName];
        if (!field) return;

        field.addEventListener("input", () => {
            if (field.classList.contains("is-invalid")) {
                validateField(fieldName);
                if (fieldName === "password") {
                    validateField("confirm_password");
                }
            }
        });

        field.addEventListener("blur", () => {
            validateField(fieldName);
            if (fieldName === "password") {
                validateField("confirm_password");
            }
        });
    });

    form.addEventListener("submit", (event) => {
        let firstInvalidField = null;

        Object.keys(fields).forEach((fieldName) => {
            const isValid = validateField(fieldName);
            if (!isValid && !firstInvalidField) {
                firstInvalidField = fields[fieldName];
            }
        });

        if (firstInvalidField) {
            event.preventDefault();
            firstInvalidField.focus();
            form.reportValidity();
        }
    });
}
