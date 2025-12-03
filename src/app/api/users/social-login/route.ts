import { NextRequest, NextResponse } from 'next/server';
import {connect} from '@/dbConfig/dbConfig';
import jwt from "jsonwebtoken";
import UserModule from "@/models/userModel.js"

const User = UserModule as any 

export async function POST(request: NextRequest) {
    try {
        await connect();
    } catch (error) {
        console.error("Database connection failed:", error);
        return NextResponse.json({ message: 'Database connection error' }, { status: 500 });
    }

    const { 
        email, 
        name, 
        profileImage, 
        provider 
    } = await request.json();

    if (!email || !name || !provider) {
        return NextResponse.json({ message: 'Missing required fields for social login.' }, { status: 400 });
    }

    try {
        let user = await User.findOne({ email });
        let status = 200;

        if (user) {
            user.name = name;
            user.profileImage = profileImage;
            user.lastLoginProvider = provider; 
            await user.save();

            console.log(`Social Login Success: Existing user ${email} via ${provider}`);
            
        } else {
            let usernameBase = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            let username = usernameBase;
            let counter = 1;
            while (await User.findOne({ username })) {
                username = `${usernameBase}${counter}`;
                counter++;
            }
            user = await User.create({
                email,
                name,
                username: username,
                profileImage,
                isSocial: true,
                provider, 
            });
            status = 201;
            
            console.log(`Social Signup Success: New user ${email} via ${provider}`);
        }


        const tokenData = {
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: "7d" });
        const response = NextResponse.json({
            message: status === 201 ? 'Signup successful' : 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            token
        }, { status });
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60, 
            path: '/',
            sameSite: 'lax',
        });
        return response


    } catch (error) {
        console.error("Backend processing error:", error);
        return NextResponse.json({ message: 'Internal server error during social login/signup.' }, { status: 500 });
    }
}