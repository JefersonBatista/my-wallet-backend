import { Router } from "express";

import {
  getTransactions,
  registerTransaction,
} from "../controllers/transactionController.js";
import schemaValidation from "../middlewares/schemaValidationMiddleware.js";
import { transactionSchema } from "../schemas/index.js";
import authValidation from "../middlewares/authValidationMiddleware.js";

const transactionsRouter = Router();

// Running schemaValidation before authValidation
transactionsRouter.get("/transactions", authValidation, getTransactions);
transactionsRouter.post(
  "/transactions",
  schemaValidation(transactionSchema),
  authValidation,
  registerTransaction
);

export default transactionsRouter;
