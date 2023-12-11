import { Router } from "express";

import {
  getTransactions,
  getTransactionById,
  registerTransaction,
  deleteTransaction,
  updateTransaction,
  deleteAllTransactions,
} from "../controllers/transactionController.js";
import schemaValidation from "../middlewares/schemaValidationMiddleware.js";
import { transactionSchema } from "../schemas/index.js";
import authValidation from "../middlewares/authValidationMiddleware.js";

const transactionsRouter = Router();

transactionsRouter.get("/transactions", authValidation, getTransactions);

transactionsRouter.get("/transactions/:id", authValidation, getTransactionById);

// Running schemaValidation before authValidation
transactionsRouter.post(
  "/transactions",
  schemaValidation(transactionSchema),
  authValidation,
  registerTransaction
);

transactionsRouter.delete(
  "/transactions/all",
  authValidation,
  deleteAllTransactions
);

transactionsRouter.delete(
  "/transactions/:id",
  authValidation,
  deleteTransaction
);

transactionsRouter.put(
  "/transactions/:id",
  schemaValidation(transactionSchema),
  authValidation,
  updateTransaction
);

export default transactionsRouter;
