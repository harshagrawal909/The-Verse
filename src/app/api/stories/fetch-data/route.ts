import {NextResponse,NextRequest} from 'next/server';
import { connect } from "@/dbConfig/dbConfig";
import {getDataFromToken} from '@/utils/authMiddleware';
import StoryModule from "@/models/storyModel.js"
import UserModule from "@/models/userModel.js"

const Story = StoryModule as any
const User = UserModule as any

export async function GET(request:NextRequest){
    console.log("GET /api/stories/fetch-data endpoint called");
    try {
        await connect()
        let filter:any = { isPublished: true };
        let isAdmin = false
        const userId = await getDataFromToken(request);
        if (userId) {
            const user = await User.findById(userId);
            console.log("Authenticated user: ", user);
            if (user && user.isAdmin) {
                isAdmin = true;
            }
        }
        if(isAdmin){
            filter = {}; 
        }
        
        const stories = await Story.find(filter).sort({ createdAt: -1 });
        console.log(`Stories fetched (${isAdmin ? 'All' : 'Published'}):`, stories.length);
        return NextResponse.json({ stories }, { status: 200 });

    } catch (error) {
        console.error('Error fetching stories:', error);
        return NextResponse.json(
        { success: false, message: 'Error fetching stories', error: error.message },
        { status: 500 }
        );
    }
}