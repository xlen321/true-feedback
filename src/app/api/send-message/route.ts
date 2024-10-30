/* eslint-disable @typescript-eslint/no-explicit-any */

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { Message } from "@/models/user.model";

export async function POST(request: Request) {
  await dbConnect();

  const { username, content } = await request.json();

  try {
    const user = await UserModel.findOne({ username });

    if (!user)
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 }
      );

    if (!user.isAcceptingMessages)
      return Response.json(
        { message: "User is not accepting messages", success: false },
        { status: 403 }
      );

    const newMessage = { content, createdAt: new Date() };

    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      { message: "Message sent successfully", success: true },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(`Error adding message: ${error}`);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
