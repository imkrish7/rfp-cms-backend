import { MongoClient } from "mongodb";

async function connectDB() {
    let mongoClient = null;
    try {
        mongoClient = new MongoClient(process.env.MONGODB_URI as string)
        await mongoClient.connect();

        await mongoClient.db("rfp").command({ ping: 1 });

        return mongoClient;
        
    } catch (error) {
        console.log("Error: in connecting mongo server");
        process.exit(1);
    }
}

export {
    connectDB
}