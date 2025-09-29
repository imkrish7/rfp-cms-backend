import { Db, MongoClient } from "mongodb";


let client: MongoClient;
let db: Db;

async function connectDB(): Promise<{db: Db, client: MongoClient}> {
    try {
        if (db && client) return {client , db};
        client = new MongoClient(process.env.MONGODB_URI as string)
        await client.connect();

        db = client.db("rfp");

        return {client, db}
        
    } catch (error) {
        console.log("Error: in connecting mongo server");
        process.exit(1);
    }
}

export {
    connectDB
}