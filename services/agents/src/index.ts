import "dotenv/config"
import cors from "cors"
import express from "express"
import https from "node:https";
import { connectDB } from "./core/db";
import { routes as chatRFPRoutes } from "./core/routes/rfpChat";


const PORT = process.env.PORT;

if (!PORT) {
    throw new Error("Please add PORT into .env file!")
}

const app = express();

app.use(express.json())
app.use(cors())

app.use("/", chatRFPRoutes)
app.get("/", (req, res) => {
    return res.json({message: "Hello world"})
})

async function runServer() {
    try {
        await connectDB()
        // const server = https.createServer(app)
        // server.listen(PORT);
        app.listen(PORT, () => {
            console.log("APP is running!")
        })
    } catch (error) {
        console.error(error)
    }
}

runServer().then(() => {
    console.log("Server is running on:", PORT)
}).catch(() => {
    console.log("Error: Server is dead")
})

