// require('dotenv').path({path: './env'});

import dotenv from 'dotenv';
import connectDB from './db/db.js';
import { app } from './app.js';

dotenv.config({
    path: '../.env'
})

connectDB()
.then(()=>{

    app.on("error",(err)=>{
        console.log("Error: "+err);
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Mongodb connection failed: "+err);
})