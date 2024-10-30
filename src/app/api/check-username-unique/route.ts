/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const usernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    // validate with zod
    const result = usernameQuerySchema.safeParse(queryParam);

    console.log(result);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(",")
              : "Invalid username",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser)
      return Response.json(
        { success: false, message: "Username already exists" },
        { status: 400 }
      );

    return Response.json(
      { success: true, message: "Username is available" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error(`Error checking if username is unique: ${error}`);
    return Response.json(
      { success: false, message: "Error checking if username is unique" },
      { status: 500 }
    );
  }
}
