import { NextResponse,NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import bcrypt from "bcryptjs";
import UserModule from "@/models/userModel.js"

const User = UserModule as any

export async function POST(request:NextRequest){
    
    try{
        await connect()
        const {username,email,password} = await request.json()
        const userEmail =  await User.findOne({email})
        if(userEmail){
            return NextResponse.json({message:`Email ${email} already exists`},{status:400})
        }
        const userUsername =  await User.findOne({username})
        if(userUsername){
            return NextResponse.json({message:`Username ${username} already exists`},{status:400})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const newUser =  new User({
            username,
            password:hashedPassword,
            email
        })
        const savedUser = await newUser.save()
        return NextResponse.json({message:"User created successfully",user:savedUser},{status:201})
    } catch(error:any){
        return NextResponse.json({message:error.message},{status:500})
    }



}