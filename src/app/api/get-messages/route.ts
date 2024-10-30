/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);

  const user: User = session?.user;

  if (!session || !session.user)
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: {path: "$messages", preserveNullAndEmptyArrays: true}  },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0)
      return Response.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );

    return Response.json(
      { success: true, message: user[0].messages },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Failed to get messages: ${error}`);
    return Response.json(
      {
        success: false,
        message: "Failed to get messages",
      },
      { status: 500 }
    );
  }
}
