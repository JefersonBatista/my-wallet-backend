import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as generateToken } from "uuid";

import { userSchema, loginSchema } from "./schemas.js";

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

app.post("/login", async (req, res) => {
  const login = req.body;

  const validation = loginSchema.validate(login, { abortEarly: false });
  if (validation.error) {
    res
      .status(422)
      .send(validation.error.details.map((detail) => detail.message));
    return;
  }

  try {
    const user = await db.collection("users").findOne({
      email: login.email,
    });

    if (!user) {
      res.status(404).send("Nenhum usuário com esse email está cadastrado");
      return;
    }

    if (!bcrypt.compareSync(login.password, user.passwordHash)) {
      res.status(401).send("Email e senha não conferem!");
      return;
    }

    const token = generateToken();
    await db.collection("sessions").insertOne({ userId: user._id, token });

    res.status(200).send(token);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro interno no servidor");
  }
});

app.post("/logout", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(422).send("Nenhum token de autenticação foi enviado!");
    return;
  }

  const sessionsCollection = db.collection("sessions");

  const session = await sessionsCollection.findOne({ token });

  if (!session) {
    res.status(404).send("Nenhuma sessão com esse token foi encontrada");
    return;
  }

  await sessionsCollection.deleteOne({ _id: session._id });

  res.sendStatus(200);
});

app.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});
