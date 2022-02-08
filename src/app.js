import express, { json } from "express";
import cors from "cors";

import { authRouter, transactionsRouter } from "./routers/index.js";

const app = express();
app.use(cors());
app.use(json());

app.use(authRouter);
app.use(transactionsRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
