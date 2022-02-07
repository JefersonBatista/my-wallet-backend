import bcrypt from "bcrypt";
import { v4 as generateToken } from "uuid";

import db from "../db.js";

export async function signUp(req, res) {
  const newUser = req.body;

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
}

export async function login(req, res) {
  const login = req.body;

  try {
    const user = await db.collection("users").findOne({
      email: login.email,
    });

    if (!user) {
      res.status(404).send("Nenhum usuário com esse email está cadastrado");
      return;
    }

    if (!bcrypt.compareSync(login.password, user.passwordHash)) {
      res.status(401).send("Senha incorreta!");
      return;
    }

    const token = generateToken();
    await db.collection("sessions").insertOne({ userId: user._id, token });

    res.status(200).send(token);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro interno no servidor");
  }
}

export async function logout(req, res) {
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
}
