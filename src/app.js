import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import { userSchema } from "./schemas.js";

dotenv.config();

const dbClient = new MongoClient(process.env.MONGO_URI);
await dbClient.connect();
const db = dbClient.db("my-wallet");

const app = express();
app.use(cors());
app.use(json());

app.post("/sign-up", async (req, res) => {
  const newUser = req.body;

  const validation = userSchema.validate(newUser, { abortEarly: false });
  if (validation.error) {
    res
      .status(422)
      .send(validation.error.details.map((detail) => detail.message));
    return;
  }

  newUser.passwordHash = bcrypt.hashSync(newUser.password, 10);
  delete newUser.password;

  try {
    const usersCollection = db.collection("users");

    const userWithSameEmail = await usersCollection.findOne({
      email: newUser.email,
    });

    if (userWithSameEmail) {
      res.status(409).send("Um usuário com esse email já está cadastrado");
      return;
    }

    await usersCollection.insertOne(newUser);

    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro interno no servidor");
  }
});

app.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});
