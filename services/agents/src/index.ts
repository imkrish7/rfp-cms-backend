import "dotenv/config"
import express, { Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import https from "node:https";

const PORT = process.env.PORT;

if (!PORT) {
    throw new Error("Please add PORT into .env file!")
}

const app = express();


app.post("/chat/:rfpId", async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: "Our server is dead!"})
    }
    
})


const server = https.createServer(app)

server.listen(PORT);