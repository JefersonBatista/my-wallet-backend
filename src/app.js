import express, { json } from "express";
import cors from "cors";

import { signUp, login, logout } from "./controllers/authController.js";
import {
  getTransactions,
  registerTransaction,
} from "./controllers/transactionController.js";

const app = express();
app.use(cors());
app.use(json());

app.post("/sign-up", signUp);

app.post("/login", login);

app.post("/logout", logout);

app.get("/transactions", getTransactions);

app.post("/transactions", registerTransaction);

app.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});
