import { Router } from "express";

import { signUp, login, logout } from "../controllers/authController.js";
import schemaValidation from "../middlewares/schemaValidationMiddleware.js";
import { userSchema, loginSchema } from "../schemas/index.js";

const authRouter = Router();

authRouter.post("/sign-up", schemaValidation(userSchema), signUp);
authRouter.post("/login", schemaValidation(loginSchema), login);
authRouter.post("/logout", logout);

export default authRouter;
