
import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { getDataFromToken } from "@/utils/authMiddleware";

connect();

export async function GET(request: NextRequest) {
    try {
        const userId = getDataFromToken(request);

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized access" }, { status: 401 });
        }
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({
            message: "User found",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.profileImage || "/images/user-avatar.png",
                isAdmin: user.isAdmin,
            }
        });

    } catch (error) {
        console.error("Get User API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}