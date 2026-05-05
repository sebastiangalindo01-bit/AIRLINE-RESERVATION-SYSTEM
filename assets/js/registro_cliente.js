const form = document.getElementById("forCliente");
const API_BASE_URL = "http://localhost:3000";

if (form) {
    const countryRegions = {
        Colombia: [
            "Antioquia",
            "Cundinamarca",
            "Valle del Cauca",
            "Santander",
            "Bolivar",
            "Atlantico",
            "Risaralda",
            "Nariño",
            "Huila",
            "Tolima"
        ],
        "Estados Unidos": [
            "California",
            "Texas",
            "Florida",
            "New York",
            "Illinois",
            "Washington"
        ],
        España: [
            "Madrid",
            "Cataluña",
            "Andalucia",
            "Valencia",
            "Galicia",
            "Pais Vasco"
        ],
        Brasil: [
            "Sao Paulo",
            "Rio de Janeiro",
            "Minas Gerais",
            "Bahia",
            "Parana",
            "Pernambuco"
        ],
        Francia: [
            "Ile-de-France",
            "Normandie",
            "Occitanie",
            "Bretagne",
            "Nouvelle-Aquitaine",
            "Grand Est"
        ]
    };

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

    const departamentoLabel = form.querySelector('label[for="departamento_estado"]');

    const getRegionPlaceholder = (country) => {
        if (!country) return "Seleccione el departamento o estado de residencia";
        return country === "Colombia"
            ? "Seleccione el departamento de residencia"
            : "Seleccione el estado o provincia de residencia";
    };

    const updateRegionLabel = (country) => {
        if (!departamentoLabel) return;
        departamentoLabel.textContent = country === "Colombia" ? "Departamento*" : "Estado/Provincia*";
    };

    const renderRegionsByCountry = (country) => {
        const regionSelect = fields.departamento_estado;
        const availableRegions = countryRegions[country] || [];
        const hasCountry = Boolean(country);

        regionSelect.innerHTML = "";

        const placeholderOption = document.createElement("option");
        placeholderOption.value = "";
        placeholderOption.textContent = getRegionPlaceholder(country);
        regionSelect.appendChild(placeholderOption);

        availableRegions.forEach((regionName) => {
            const option = document.createElement("option");
            option.value = regionName;
            option.textContent = regionName;
            regionSelect.appendChild(option);
        });

        regionSelect.disabled = !hasCountry;
        regionSelect.value = "";
        updateRegionLabel(country);
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
            const selectedCountry = fields.pais.value;
            if (!selectedCountry) return "";
            if (!value) return "Selecciona un departamento o estado.";

            const allowedRegions = countryRegions[selectedCountry] || [];
            if (allowedRegions.length > 0 && !allowedRegions.includes(value)) {
                return "Selecciona una opcion valida para el pais elegido.";
            }

            return "";
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

    renderRegionsByCountry(fields.pais.value);

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

    fields.pais.addEventListener("change", () => {
        renderRegionsByCountry(fields.pais.value);
        validateField("pais");
        validateField("departamento_estado");
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        let firstInvalidField = null;

        Object.keys(fields).forEach((fieldName) => {
            const isValid = validateField(fieldName);
            if (!isValid && !firstInvalidField) {
                firstInvalidField = fields[fieldName];
            }
        });

        if (firstInvalidField) {
            firstInvalidField.focus();
            form.reportValidity();
            return;
        }

        const payload = {
            tipo_documento: fields.tipo_documento.value,
            numero_identificacion: fields.numero_identificacion.value.trim(),
            nombre: fields.nombre.value.trim(),
            apellido: fields.apellido.value.trim(),
            email: fields.email.value.trim(),
            telefono: fields.telefono.value.trim(),
            telefono_alterno: fields.telefono_alterno.value.trim(),
            password: fields.password.value,
            confirm_password: fields.confirm_password.value,
            direccion_residencia: fields.direccion_residencia.value.trim(),
            pais: fields.pais.value,
            departamento_estado: fields.departamento_estado.value,
            ciudad: fields.ciudad.value.trim()
        };

        const submitButton = form.querySelector("button[type='submit']");
        const originalButtonText = submitButton ? submitButton.textContent : "";

        try {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Creando cuenta...";
            }

            const response = await fetch(`${API_BASE_URL}/api/clientes/registro`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                alert(data.message || "No fue posible registrar el cliente.");
                return;
            }

            alert("Registro exitoso. Ahora puedes iniciar sesión.");
            form.reset();
            renderRegionsByCountry("");
            window.location.href = "login.html";
        } catch (error) {
            alert("Error de red al registrar. Verifica que el backend esté corriendo.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });
}
