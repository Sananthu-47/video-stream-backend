import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import fs from "fs";

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
app.use(cookieParser());

// Api routes
import userRoute from "./routes/user.routes.js";


app.use('/api/v1/user',userRoute);


app.use((err, req, res, next) => {

    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0)
        fs.unlinkSync(req.files.avatar[0].path);

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
        fs.unlinkSync(req.files.coverImage[0].path);
    

    // Default error status
    let statusCode = err.status || 500;
    
    // If the error is a known ApiError, extract status code and message
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
    }
    
    // Log the error for debugging purposes
    console.error(err);

    // Send error response
    return res.status(statusCode).json(
        new ApiResponse(statusCode, err.data, err.message)
    );
});

export { app };