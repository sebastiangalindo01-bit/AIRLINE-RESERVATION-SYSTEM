document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("clientsTableBody");
    const table = document.getElementById("clientsTable");

    if (!tableBody || !table) {
        return;
    }

    const createCell = (text) => {
        const cell = document.createElement("td");
        cell.textContent = text || "-";
        return cell;
    };

    const renderClients = (clients) => {
        tableBody.innerHTML = "";

        if (!clients || clients.length === 0) {
            const emptyRow = document.createElement("tr");
            const emptyCell = document.createElement("td");
            emptyCell.colSpan = 11;
            emptyCell.textContent = "No hay clientes registrados para mostrar.";
            emptyRow.appendChild(emptyCell);
            tableBody.appendChild(emptyRow);
            return;
        }

        clients.forEach((client) => {
            const row = document.createElement("tr");

            row.appendChild(createCell(client.tipoDocumento));
            row.appendChild(createCell(client.numeroIdentificacion));
            row.appendChild(createCell(client.nombres));
            row.appendChild(createCell(client.apellidos));
            row.appendChild(createCell(client.correoElectronico));
            row.appendChild(createCell(client.telefono));
            row.appendChild(createCell(client.telefonoAlterno));
            row.appendChild(createCell(client.direccionResidencia));
            row.appendChild(createCell(client.pais));
            row.appendChild(createCell(client.estadoProvincia));
            row.appendChild(createCell(client.ciudad));

            tableBody.appendChild(row);
        });
    };

    fetch("../../data/clientes.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("No fue posible cargar los clientes.");
            }

            return response.json();
        })
        .then((clients) => {
            renderClients(clients);
        })
        .catch(() => {
            tableBody.innerHTML = "";
            const errorRow = document.createElement("tr");
            const errorCell = document.createElement("td");
            errorCell.colSpan = 11;
            errorCell.textContent = "No fue posible cargar la información de clientes.";
            errorRow.appendChild(errorCell);
            tableBody.appendChild(errorRow);
        });
});

