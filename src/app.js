import express, { json } from "express";
import cors from "cors";

import { authRouter, transactionsRouter } from "./routers/index.js";

const app = express();
app.use(cors());
app.use(json());

app.use(authRouter);
app.use(transactionsRouter);

app.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});
