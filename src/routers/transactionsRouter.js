import { Router } from "express";

import {
  getTransactions,
  registerTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import schemaValidation from "../middlewares/schemaValidationMiddleware.js";
import { transactionSchema } from "../schemas/index.js";
import authValidation from "../middlewares/authValidationMiddleware.js";

const transactionsRouter = Router();

transactionsRouter.get("/transactions", authValidation, getTransactions);

// Running schemaValidation before authValidation
transactionsRouter.post(
  "/transactions",
  schemaValidation(transactionSchema),
  authValidation,
  registerTransaction
);

transactionsRouter.delete(
  "/transactions/:transactionId",
  authValidation,
  deleteTransaction
);

export default transactionsRouter;
