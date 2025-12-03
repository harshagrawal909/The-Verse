import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function getDataFromToken(request: NextRequest) {
    
    try {
            let token=null
            const authHeader = request.headers.get("authorization");
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                console.log("Token source: Authorization Header");
            }
        
            if (!token) {
                token = request.cookies.get("token")?.value;
                console.log("Token source: Cookie 'token'");
            }

            if(!token){
                console.log("No token found in request");
                return null;
            }
        
            const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);
            return decodedToken.id;
            
    } catch (error) {
            console.error("Token verification failed:", error);
            return null;
    }

}