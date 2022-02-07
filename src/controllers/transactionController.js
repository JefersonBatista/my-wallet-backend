import dayjs from "dayjs";
import { ObjectId } from "mongodb";

import db from "../db.js";

export async function getTransactions(req, res) {
  try {
    const userId = res.locals.userId;

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
  const newTransaction = req.body;

  try {
    const userId = res.locals.userId;

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

export async function deleteTransaction(req, res) {
  const { transactionId } = req.params;

  try {
    await db
      .collection("transactions")
      .deleteOne({ _id: new ObjectId(transactionId) });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro interno no servidor");
  }
}
