const form = document.getElementById("forLogin");
const API_BASE_URL = "http://localhost:3000";
const ROLE_REDIRECT = {
    cliente: "../client/dashboard_cliente.html",
    admin: "../admin/listado_clientes.html",
    agente: "../agent/dashboard_agente.html"
};

function normalizeRole(rawRole) {
    const normalized = String(rawRole || "cliente")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    if (["admin", "administrador"].includes(normalized)) return "admin";
    if (["agente", "agent", "asesor"].includes(normalized)) return "agente";
    return "cliente";
}

if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailField = document.getElementById("email");
        const passwordField = document.getElementById("password");

        const email = emailField.value.trim();
        const password = passwordField.value;

        if (!email || !password) {
            alert("Correo y contraseña son obligatorios.");
            return;
        }

        const submitButton = form.querySelector("button[type='submit']");
        const originalButtonText = submitButton ? submitButton.textContent : "";

        try {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Validando...";
            }

            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                alert(data.message || "No fue posible iniciar sesión.");
                return;
            }

            if (data.token) {
                localStorage.setItem("authToken", data.token);
            }

            if (data.client) {
                localStorage.setItem("authUser", JSON.stringify(data.client));
            }

            alert("Inicio de sesión exitoso.");
            const role = normalizeRole(
                data.client?.role || data.client?.rol || data.client?.tipo_usuario || "cliente"
            );
            window.location.href = ROLE_REDIRECT[role] || ROLE_REDIRECT.cliente;
        } catch (error) {
            alert("Error de red al iniciar sesión. Verifica que el backend esté corriendo.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });
}
