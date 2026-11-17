import express from "express";
import dotenv from "dotenv"
import connectDB from "./config/db.js";
import router from "./routes/agent.routes.js";



dotenv.config()

const port = process.env.PORT || 8000

const app = express()



app.use(express.json())

app.use("/", router)

app.use((req, res, err, next) => {
    console.log(err)

    if(err.status) {
        return res.status(err.status).json(err.data)
    }

    return res.status(500).json({message:`agent error ${error}`})
})

// app.use("/", router)


app.get("/", (req, res) => {
    res.json({
        message: "hello from agent"
    })
})

app.listen(port, () => {
    console.log(`agent started at ${port}`)
    connectDB()
})