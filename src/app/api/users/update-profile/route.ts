import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";
import UserModule from "@/models/userModel.js"

const User = UserModule as any

connect();

export async function PUT(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized access" }, { status: 401 });
        }

        const user = await User.findById(userId).select("isAdmin");
        if (!user || !user.isAdmin) {
             return NextResponse.json({ message: "Forbidden: Only Admin can update this." }, { status: 403 });
        }

        const body = await request.json();
        const { profileImage } = body;

        if (!profileImage) {
            return NextResponse.json({ message: 'Profile Image URL is required.' }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profileImage: profileImage },
            { new: true, runValidators: true } 
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json({ message: "Admin user not found." }, { status: 404 });
        }

        return NextResponse.json(
            {
                message: 'Admin profile updated successfully.',
                user: updatedUser
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('API Error during admin profile update:', error);
        return NextResponse.json(
            { message: 'Failed to update profile.', error: (error as Error).message },
            { status: 500 }
        );
    }
}