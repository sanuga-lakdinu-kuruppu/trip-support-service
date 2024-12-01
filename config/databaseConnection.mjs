import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const ENVIRONMENT = process.env.ENVIRONMENT;
let MONGO_URI;
if (ENVIRONMENT === "production") MONGO_URI = process.env.MONGO_URI_PRODUCTION;
else if (ENVIRONMENT === "test") MONGO_URI = process.env.MONGO_URI_TEST;
else MONGO_URI = process.env.MONGO_URI_LOCAL;

let isConnected = false;

const createConnection = async () => {
  if (isConnected) {
    console.log(`using the cached data base connection :)`);
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`database connection success :)`);
  } catch (error) {
    console.log(`database connection error ${error}`);
  }
};

export default createConnection;
