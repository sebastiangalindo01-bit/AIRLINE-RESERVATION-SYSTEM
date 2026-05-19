import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import reservasRoutes from './routes/reservas.js';
import paymentsRoutes from './routes/payments.js';
import clientsRoutes from './routes/clients.js';
import usersRoutes from './routes/users.js';
import { testDatabaseConnection } from "./config/db.js";

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = new Set([
	process.env.FRONTEND_ORIGIN,
	"null",
	"http://localhost:3000",
	"http://127.0.0.1:3000",
	"http://127.0.0.1:5500",
	"http://localhost:5500"
]);

app.use(
	cors({
		origin(origin, callback) {
			if (!isProduction) {
				return callback(null, true);
			}

			if (!origin || allowedOrigins.has(origin)) {
				return callback(null, true);
			}
			return callback(new Error("Origen no permitido por CORS."));
		}
	})
);
app.use(express.json());
app.use("/api", authRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/clientes', clientsRoutes);
app.use('/api/users', usersRoutes);

app.get("/health", (_req, res) => {
	res.json({ ok: true, message: "Backend funcionando" });
});

app.get("/health/db", async (_req, res) => {
	try {
		const db = await testDatabaseConnection();
		res.json({ ok: true, databaseTime: db.now });
	} catch (error) {
		res.status(500).json({
			ok: false,
			message: "No fue posible conectar con la base de datos",
			detail: error.message
		});
	}
});

app.listen(port, () => {
	console.log(`Servidor corriendo en http://localhost:${port}`);
});
