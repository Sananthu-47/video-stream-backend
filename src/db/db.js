import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInsatnce = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        console.log(`MongoDB connected & DB host: ${connectionInsatnce.connection.host}`);

    } catch (error) {
        console.error("Error: "+ error);
        process.exit(1);
    }
}

export default connectDB;