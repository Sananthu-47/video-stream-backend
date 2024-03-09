import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

// Create an express app
const app = express();

// Allow cors on all port by *
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Accept only 16KB json data
app.use(express.json({
    limit: "16kb"
}))

// Encoding urls for params like ?q=ananth%20/jsjs%20jj
app.use(express.urlencoded({extended: true}))

// For static files
app.use(express.static("public"))

// For broweser cookie aprser
app.use(cookieParser())

export { app };