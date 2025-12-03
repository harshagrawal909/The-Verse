import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";
import mongoose from 'mongoose';
import StoryModule from "@/models/storyModel.js"
import UserModule from "@/models/userModel.js"

const Story = StoryModule as any
const User = UserModule as any

connect();

export async function POST(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Login required to post a comment or reply." }, { status: 401 });
        }

        // --- NEW: Retrieve parentCommentId from the request body ---
        const { storyId, commentText, parentCommentId } = await request.json();

        if (!storyId || !commentText || commentText.trim().length === 0) {
            return NextResponse.json({ message: 'Story ID and comment text are required.' }, { status: 400 });
        }
        
        const user = await User.findById(userId).select("username name profileImage");
        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        const newCommentOrReply = {
            userId: new mongoose.Types.ObjectId(userId),
            text: commentText.trim(),
            createdAt: new Date(),
        };
        
        let updateQuery: any;
        let arrayFilters: any[] = [];
        
        if (parentCommentId) {
            // Case 1: Adding a Reply to a specific comment
            // Use $push with arrayFilters to target the correct nested comment array.
            updateQuery = { 
                $push: { "comments.$[comment].replies": newCommentOrReply } 
            };
            arrayFilters = [
                { "comment._id": new mongoose.Types.ObjectId(parentCommentId) }
            ];
            
        } else {
            // Case 2: Adding a Top-Level Comment
            updateQuery = { 
                $push: { 
                    comments: { 
                        ...newCommentOrReply, 
                        replies: [] // Ensure replies array is initialized
                    } 
                } 
            };
        }
        
        // Find and Update Logic
        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            updateQuery,
            { 
                new: true, 
                runValidators: true,
                arrayFilters: arrayFilters // Pass arrayFilters only when needed for replies
            } 
        ).populate([
            {
                path: 'comments.userId',
                select: 'name username profileImage'
            },
            {
                path: 'comments.replies.userId', // Populate user data for nested replies
                select: 'name username profileImage'
            }
        ]);

        if (!updatedStory) {
            return NextResponse.json({ message: "Story or Parent Comment not found." }, { status: 404 });
        }

        return NextResponse.json(
            {
                message: parentCommentId ? 'Reply posted successfully.' : 'Comment posted successfully.',
                comments: updatedStory.comments,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('API Error during comment/reply submission:', error);
        return NextResponse.json(
            { message: 'Failed to post comment/reply.', error: (error as Error).message },
            { status: 500 }
        );
    }
}