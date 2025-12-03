import { NextResponse,NextRequest } from "next/server";
import User from "@/models/userModel.js"
import { connect } from "@/dbConfig/dbConfig";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
connect()
export async function POST(request:NextRequest){
    try{
        const {email,password} = await request.json();
        const user=await User.findOne({email})
        if(!user){
            return NextResponse.json({message:"User not found."},{status:404})
        }
        const isPasswordCorrect=await bcrypt.compare(password,user.password)
        if(!isPasswordCorrect){
            return NextResponse.json({message:"Invalid credentials"},{status:400})
        }
        const tokenData = {
            id:user._id,
            username:user.username,
            isAdmin:user.isAdmin
        }
        const token = jwt.sign(tokenData,process.env.JWT_SECRET!,{expiresIn:"7d"})
        const response = NextResponse.json({message:"Login successful",token},{status:200})
        response.cookies.set("token",token,{
            httpOnly: true,
            secure:process.env.NODE_ENV==="production",
            maxAge:7*24*60*60,
            path:"/",
            sameSite:"lax"
        })
                
        return response
    } catch (error) {
            console.log(error);
            return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
        }
}