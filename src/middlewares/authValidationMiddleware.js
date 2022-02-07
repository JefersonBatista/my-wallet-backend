import db from "../db.js";

export default async function authValidation(req, res, next) {
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

    res.locals.userId = session.userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um erro interno no servidor");
  }
}
