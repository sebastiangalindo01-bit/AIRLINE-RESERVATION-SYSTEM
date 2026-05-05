import { Router } from "express";
import { loginClient, registerClient } from "../controllers/auth.controller.js";

const router = Router();

router.post("/clientes/registro", registerClient);
router.post("/auth/login", loginClient);

export default router;
