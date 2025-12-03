
import { NextResponse, NextRequest } from "next/server";
import User from "@/models/userModel.js"
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";

connect();

export async function PUT(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized access" }, { status: 401 });
        }

        const body = await request.json();
        const { name, username } = body;

        if (!name || !username) {
            return NextResponse.json({ message: 'Name and Username are required.' }, { status: 400 });
        }
        
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== userId) {
            return NextResponse.json({ message: 'Username is already taken.' }, { status: 400 });
        }

        const updateData: any = {
            name: name.trim(),
            username: username.trim(),
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true } 
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        return NextResponse.json(
            {
                message: 'Profile updated successfully.',
                user: {
                    id: updatedUser._id.toString(),
                    username: updatedUser.username,
                    email: updatedUser.email,
                    avatar: updatedUser.profileImage || "/images/user-avatar.png",
                    isAdmin: updatedUser.isAdmin,
                    name: updatedUser.name
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('API Error during user profile update:', error);
        return NextResponse.json(
            { message: 'Failed to update profile.', error: (error as Error).message },
            { status: 500 }
        );
    }
}