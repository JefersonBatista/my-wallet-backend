import dayjs from "dayjs";

import db from "../db.js";

import { transactionSchema } from "../schemas/index.js";

export async function getTransactions(req, res) {
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
}

export async function registerTransaction(req, res) {
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
}
