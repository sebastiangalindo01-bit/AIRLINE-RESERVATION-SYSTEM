import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

const DEV_JWT_SECRET = "dev-jwt-secret-change-me";

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (secret && String(secret).trim() !== "") {
        return secret;
    }

    if (process.env.NODE_ENV !== "production") {
        console.warn("JWT_SECRET no definido; usando clave de desarrollo.");
        return DEV_JWT_SECRET;
    }

    return null;
}

const REQUIRED_FIELDS = [
    "tipo_documento",
    "numero_identificacion",
    "nombre",
    "apellido",
    "email",
    "telefono",
    "direccion_residencia",
    "pais",
    "departamento_estado",
    "ciudad",
    "password"
];

function getMissingFields(payload) {
    return REQUIRED_FIELDS.filter((field) => {
        const value = payload[field];
        return value === undefined || value === null || String(value).trim() === "";
    });
}

export async function registerClient(req, res) {
    try {
        const payload = req.body || {};
        const missingFields = getMissingFields(payload);

        if (missingFields.length > 0) {
            return res.status(400).json({
                ok: false,
                message: "Faltan campos obligatorios.",
                missingFields
            });
        }

        if (payload.confirm_password && payload.password !== payload.confirm_password) {
            return res.status(400).json({
                ok: false,
                message: "Las contraseñas no coinciden."
            });
        }

        const exists = await pool.query(
            `SELECT 1
             FROM clientes
             WHERE email = $1 OR numero_identificacion = $2
             LIMIT 1`,
            [payload.email.trim().toLowerCase(), payload.numero_identificacion.trim()]
        );

        if (exists.rowCount > 0) {
            return res.status(409).json({
                ok: false,
                message: "Ya existe un cliente con ese correo o número de identificación."
            });
        }

        const passwordHash = await bcrypt.hash(payload.password, 10);

        const result = await pool.query(
            `INSERT INTO clientes (
                tipo_documento,
                numero_identificacion,
                nombre,
                apellido,
                email,
                telefono,
                telefono_alterno,
                direccion_residencia,
                pais,
                departamento_estado,
                ciudad,
                password_hash
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            )
            RETURNING id, nombre, apellido, email`,
            [
                payload.tipo_documento.trim(),
                payload.numero_identificacion.trim(),
                payload.nombre.trim(),
                payload.apellido.trim(),
                payload.email.trim().toLowerCase(),
                payload.telefono.trim(),
                payload.telefono_alterno ? payload.telefono_alterno.trim() : null,
                payload.direccion_residencia.trim(),
                payload.pais.trim(),
                payload.departamento_estado.trim(),
                payload.ciudad.trim(),
                passwordHash
            ]
        );

        return res.status(201).json({
            ok: true,
            message: "Cliente registrado correctamente.",
            client: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: "No se pudo registrar el cliente.",
            detail: error.message
        });
    }
}

export async function loginClient(req, res) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                message: "Correo y contraseña son obligatorios."
            });
        }

        const result = await pool.query(
            `SELECT id, nombre, apellido, email, rol, password_hash
             FROM clientes
             WHERE email = $1
             LIMIT 1`,
            [String(email).trim().toLowerCase()]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({
                ok: false,
                message: "Credenciales inválidas."
            });
        }

        const client = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, client.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                ok: false,
                message: "Credenciales inválidas."
            });
        }

        const jwtSecret = getJwtSecret();
        if (!jwtSecret) {
            return res.status(500).json({
                ok: false,
                message: 'Configuración del servidor inválida: falta JWT_SECRET'
            });
        }

        const token = jwt.sign(
            {
                sub: client.id,
                email: client.email,
                name: `${client.nombre} ${client.apellido}`,
                role: client.rol || client.role || 'CLIENT'
            },
            jwtSecret,
            { expiresIn: '1h' }
        );

        return res.json({
            ok: true,
            message: 'Inicio de sesión exitoso.',
            token,
            client: {
                id: client.id,
                nombre: client.nombre,
                apellido: client.apellido,
                email: client.email,
                rol: client.rol
            }
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: "No se pudo iniciar sesión.",
            detail: error.message
        });
    }
}
