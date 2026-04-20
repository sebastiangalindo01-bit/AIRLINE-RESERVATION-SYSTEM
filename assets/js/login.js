const form = document.getElementById("forLogin");
const API_BASE_URL = "http://localhost:3000";

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
            window.location.href = "../client/dashboard_cliente.html";
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
