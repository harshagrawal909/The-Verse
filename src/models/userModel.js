import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        // required:[true,"Please provide a username"],
        unique:true
    },
    name:{
        type:String
    },
    email:{
        type:String,
        required:[true,"Please provide a email"],
        unique:true
    },
    isSocial:{ 
        type:Boolean,
        default:false
    },
    provider: {
        type: String,
        enum: ['manual', 'google', 'facebook'],
        default: 'manual'
    },
    password:{
        type:String,
        required: function() {
            return !this.isSocial;
        }
    },
    profileImage: {
        type: String 
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    forgotPasswordToken:String,
    forgotPasswordTokenExpiry:Date,
    verifyToken:String,
    verifyTokenExpiry:Date
})

const User = mongoose.models.users || mongoose.model("users",userSchema)
export default User