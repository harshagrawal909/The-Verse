import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const response = NextResponse.json(
            { message: "Logout successful", success: true },
            { status: 200 }
        );


        const cookieOptions = {
            httpOnly: true,
            expires: new Date(0),
            path: '/',
        };

        response.cookies.set("token", "", cookieOptions);

        response.cookies.set("__Secure-next-auth.session-token", "", cookieOptions);

        response.cookies.set("next-auth.session-token", "", cookieOptions);

        return response;

    } catch (error) {
        console.error("Logout API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}