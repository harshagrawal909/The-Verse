// src/app/api/users/update-profile-picture/route.ts

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
        const { profileImage } = body; // This is the URL of the uploaded image

        if (!profileImage) {
            return NextResponse.json({ message: 'Profile Image URL is required.' }, { status: 400 });
        }
        
        // Update the user document with the new image URL
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profileImage: profileImage },
            { new: true, runValidators: true } 
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        // Return a clean UserData object matching the frontend structure
        return NextResponse.json(
            {
                message: 'Profile picture updated successfully.',
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
        console.error('API Error during profile picture update:', error);
        return NextResponse.json(
            { message: 'Failed to update profile picture.', error: (error as Error).message },
            { status: 500 }
        );
    }
}