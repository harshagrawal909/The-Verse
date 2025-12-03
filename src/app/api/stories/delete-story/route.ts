import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";
import StoryModule from "@/models/storyModel.js"
import UserModule from "@/models/userModel.js"

const Story = StoryModule as any
const User = UserModule as any

connect();

export async function DELETE(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized access" }, { status: 401 });
        }
        
        const user = await User.findById(userId).select("isAdmin");
        if (!user || !user.isAdmin) {
             return NextResponse.json({ message: "Forbidden: Not an admin" }, { status: 403 });
        }
        
        const url = new URL(request.url);
        const storyId = url.searchParams.get('id');

        if (!storyId) {
            return NextResponse.json(
                { success: false, message: 'Story ID is required for deletion.' },
                { status: 400 }
            );
        }

        const deletedStory = await Story.findByIdAndDelete(storyId);

        if (!deletedStory) {
            return NextResponse.json({ message: "Story not found for deletion." }, { status: 404 });
        }

        return NextResponse.json(
            {
                message: 'Story deleted successfully.',
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('API Error during story deletion:', error);
        return NextResponse.json(
            { message: 'Failed to delete story.', error: error.message },
            { status: 500 }
        );
    }
}