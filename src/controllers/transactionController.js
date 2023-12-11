import dayjs from "dayjs";
import { ObjectId } from "mongodb";

import db from "../db.js";

export async function getTransactions(_, res) {
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

export async function getTransactionById(req, res) {
  const { id } = req.params;

  try {
    const userId = res.locals.userId;

    const transaction = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(id) });

    if (!transaction) {
      res.status(404).send("Transação não encontrada");
      return;
    }

    if (transaction.userId.toString() !== userId.toString()) {
      res
        .status(403)
        .send("Você não pode obter uma transação que não é do seu usuário!");
      return;
    }

    res.status(200).send(transaction);
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
  const { id } = req.params;

  try {
    const userId = res.locals.userId;

    const transaction = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(id) });

    if (!transaction) {
      res.status(404).send("Transação não encontrada");
      return;
    }

    if (transaction.userId.toString() !== userId.toString()) {
      res
        .status(403)
        .send("Você não pode deletar uma transação que não é do seu usuário!");
      return;
    }

    await db.collection("transactions").deleteOne({ _id: new ObjectId(id) });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro interno no servidor");
  }
}

export async function deleteAllTransactions(_, res) {
  try {
    const userId = res.locals.userId;

    await db.collection("transactions").deleteMany({ userId });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro interno no servidor");
  }
}

export async function updateTransaction(req, res) {
  const { id } = req.params;

  const updatedTransaction = req.body;

  try {
    const userId = res.locals.userId;

    const transaction = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(id) });

    if (!transaction) {
      res.status(404).send("Transação não encontrada");
      return;
    }

    if (transaction.userId.toString() !== userId.toString()) {
      res
        .status(403)
        .send("Você não pode editar uma transação que não é do seu usuário!");
      return;
    }

    await db
      .collection("transactions")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedTransaction });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro interno no servidor");
  }
}
