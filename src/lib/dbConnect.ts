/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log(`Already connected to database`);
    return;
  }
  try {
    const db = await mongoose.connect(
      `${process.env.MONGO_URI}/${process.env.DB_NAME}` || "",
      {}
    );

    connection.isConnected = db.connections[0].readyState;
    console.log(`Database connected successfully`);
  } catch (error: any) {
    console.error(`Database connection failed: ${error}`);
    process.exit(1);
  }
}

export default dbConnect;
