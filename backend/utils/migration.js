import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function migrate() {
  await client.connect();

  const testDB = client.db("test");
  const studbudsDB = client.db("studbuds");

  const collections = await testDB.listCollections().toArray();

  for (const coll of collections) {
    const name = coll.name;
    console.log("Migrating:", name);

    const data = await testDB.collection(name).find({}).toArray();
    if (data.length === 0) continue;

    await studbudsDB.collection(name).insertMany(data);
  }

  console.log("Done!");
  await client.close();
}

migrate();
