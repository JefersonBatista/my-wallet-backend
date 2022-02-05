import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as generateToken } from "uuid";
import dayjs from "dayjs";

import { userSchema, loginSchema, transactionSchema } from "./schemas.js";

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
    res.status(401).send("Você não está autorizado!");
    return;
  }

  try {
    const sessionsCollection = db.collection("sessions");

    const session = await sessionsCollection.findOne({ token });

    if (!session) {
      res.status(401).send("Você não está autorizado!");
      return;
    }

    await sessionsCollection.deleteOne({ _id: session._id });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro interno no servidor");
  }
});

app.get("/transactions", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).send("Você não está autorizado!");
    return;
  }

  try {
    const sessionsCollection = db.collection("sessions");

    const session = await sessionsCollection.findOne({ token });

    if (!session) {
      res.status(401).send("Você não está autorizado!");
      return;
    }

    const userId = session.userId;

    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ _id: userId });

    const transactionsCollection = db.collection("transactions");

    const transactions = {};
    transactions.user = user.name;
    transactions.list = await transactionsCollection.find({ userId }).toArray();

    res.status(200).send(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro interno no servidor");
  }
});

app.post("/transactions", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).send("Você não está autorizado!");
    return;
  }

  const newTransaction = req.body;

  const validation = transactionSchema.validate(newTransaction, {
    abortEarly: false,
  });
  if (validation.error) {
    res
      .status(422)
      .send(validation.error.details.map((detail) => detail.message));
    return;
  }

  try {
    const sessionsCollection = db.collection("sessions");

    const session = await sessionsCollection.findOne({ token });

    if (!session) {
      res.status(401).send("Você não está autorizado!");
      return;
    }

    const userId = session.userId;

    newTransaction.userId = userId;
    newTransaction.date = dayjs().format("DD/MM");

    // To facilitate sorting on the front-end
    newTransaction.timestamp = Date.now();

    const transactionsCollection = db.collection("transactions");

    await transactionsCollection.insertOne(newTransaction);

    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro interno no servidor");
  }
});

app.listen(5000, () => {
  console.log("Rodando em http://localhost:5000");
});
