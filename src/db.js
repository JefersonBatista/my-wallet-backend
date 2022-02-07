import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const dbClient = new MongoClient(process.env.MONGO_URI);
await dbClient.connect();
const db = dbClient.db("my-wallet");

export default db;
