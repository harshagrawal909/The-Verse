import mongoose from "mongoose"

export async function connect(){
    try{
        await mongoose.connect(process.env.MONGO_URI!)
        const connection= mongoose.connection;
        connection.on('connected',()=>{
            console.log("mongodb connected sucessfully")
        }) 
        
        connection.on("error",(error)=>{
            console.log("mongodb connection error, please make sure mongodb is running. "+ error)
            process.exit()
        })
    } catch(error){
        console.log("something goes wrong")
        console.log(error)
    }
}