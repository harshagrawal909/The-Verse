import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";
import UserModule from '@/models/userModel.js'; 
import StoryModule from "@/models/storyModel.js"

const User = UserModule as any;
const Story = StoryModule as any;

connect();

export async function PUT(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized access" }, { status: 401 });
        }
        
        const user = await User.findById(userId).select("isAdmin");
        if (!user || !user.isAdmin) {
             return NextResponse.json({ message: "Forbidden: Not an admin" }, { status: 403 });
        }

        const body = await request.json();
        const {
            id, // ID is crucial for identifying the story to update
            title,
            description,
            content,
            category,
            coverImage, // This is now the URL
            tags,
            isPublished,
            isFeatured,
            isSeries,
            seriesName
        } = body;

        if (!id || !title || !description || !content || !coverImage) {
            return NextResponse.json(
                { message: 'Missing required fields for update.' },
                { status: 400 }
            );
        }

        const updateData = {
            title,
            description,
            content,
            category,
            coverImage,
            tags: tags || [],
            isPublished: isPublished || false,
            isFeatured: isFeatured || false,
            isSeries: isSeries || false,
            seriesName: isSeries ? seriesName : undefined,
        };

        const updatedStory = await Story.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true } 
        );

        if (!updatedStory) {
            return NextResponse.json({ message: "Story not found for update." }, { status: 404 });
        }

        return NextResponse.json(
            {
                message: 'Story updated successfully.',
                story: updatedStory
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('API Error during story update:', error);
        return NextResponse.json(
            { message: 'Failed to update story.', error: error.message },
            { status: 500 }
        );
    }
}