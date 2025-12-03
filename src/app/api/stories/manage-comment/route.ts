// src/app/api/stories/manage-comment/route.ts

import { NextResponse, NextRequest } from "next/server";
import Story from "@/models/storyModel.js"
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";
import mongoose from 'mongoose';

connect();

const populateComments = (story: any) => {
    return story.populate([
        { path: 'comments.userId', select: 'name username profileImage' },
        { path: 'comments.replies.userId', select: 'name username profileImage' }
    ]);
};

// Helper function to find the story and verify user ownership of the comment/reply
const findAndVerifyOwner = async (storyId: string, commentId: string, userId: string) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const commentObjectId = new mongoose.Types.ObjectId(commentId);

    const story = await Story.findById(storyId);

    if (!story) return { success: false, message: "Story not found.", status: 404 };
    
    // Check if it's a top-level comment
    const topLevelComment = story.comments.id(commentId);
    if (topLevelComment) {
        if (topLevelComment.userId.equals(userObjectId)) {
            return { success: true, story, isReply: false };
        }
    }
    
    // Check if it's a nested reply
    for (const comment of story.comments) {
        const reply = comment.replies.id(commentId);
        if (reply) {
            if (reply.userId.equals(userObjectId)) {
                return { success: true, story, isReply: true, parentId: comment._id };
            }
        }
    }

    return { success: false, message: "Comment not found or user is not the owner.", status: 403 };
};


export async function PUT(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized access" }, { status: 401 });
        }

        const { storyId, commentId, newText } = await request.json();

        if (!storyId || !commentId || !newText || newText.trim().length === 0) {
            return NextResponse.json({ message: "Missing required fields: storyId, commentId, newText." }, { status: 400 });
        }
        
        const verification = await findAndVerifyOwner(storyId, commentId, userId);
        if (!verification.success) {
            return NextResponse.json({ message: verification.message }, { status: verification.status });
        }
        
        const { isReply, parentId } = verification;
        const commentObjectId = new mongoose.Types.ObjectId(commentId);
        
        let updateQuery: any = {};
        let arrayFilters: any[] = [];
        
        if (isReply && parentId) {
            // Update a nested reply
            updateQuery = { $set: { "comments.$[comment].replies.$[reply].text": newText.trim() } };
            arrayFilters = [
                { "comment._id": parentId },
                { "reply._id": commentObjectId }
            ];
        } else if (!isReply) {
            // Update a top-level comment
            updateQuery = { $set: { "comments.$[comment].text": newText.trim() } };
            arrayFilters = [
                { "comment._id": commentObjectId }
            ];
        } else {
             return NextResponse.json({ message: "Comment structure could not be identified." }, { status: 400 });
        }
        
        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            updateQuery,
            { new: true, runValidators: true, arrayFilters } 
        );

        if (!updatedStory) {
             return NextResponse.json({ message: "Update failed." }, { status: 500 });
        }

        const populatedStory = await populateComments(updatedStory);

        return NextResponse.json(
            {
                message: 'Comment updated successfully.',
                comments: populatedStory.comments,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('API Error during comment update:', error);
        return NextResponse.json(
            { message: 'Failed to update comment.', error: (error as Error).message },
            { status: 500 }
        );
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized access" }, { status: 401 });
        }
        
        const url = new URL(request.url);
        const storyId = url.searchParams.get('storyId');
        const commentId = url.searchParams.get('commentId');

        if (!storyId || !commentId) {
            return NextResponse.json({ message: "Missing required fields: storyId, commentId." }, { status: 400 });
        }

        const verification = await findAndVerifyOwner(storyId, commentId, userId);
        if (!verification.success) {
            return NextResponse.json({ message: verification.message }, { status: verification.status });
        }
        
        const { story, isReply, parentId } = verification;
        const commentObjectId = new mongoose.Types.ObjectId(commentId);
        
        let updateQuery: any = {};
        
        if (isReply && parentId) {
            // Delete a nested reply
            updateQuery = { 
                $pull: { "comments.$[comment].replies": { _id: commentObjectId } } 
            };
        } else if (!isReply) {
            // Delete a top-level comment
            updateQuery = { 
                $pull: { comments: { _id: commentObjectId } } 
            };
        } else {
             return NextResponse.json({ message: "Comment structure could not be identified." }, { status: 400 });
        }
        
        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            updateQuery,
            { 
                new: true, 
                arrayFilters: isReply ? [
                    { "comment._id": parentId }
                ] : []
            } 
        );

        if (!updatedStory) {
             return NextResponse.json({ message: "Deletion failed." }, { status: 500 });
        }
        
        const populatedStory = await populateComments(updatedStory);

        return NextResponse.json(
            {
                message: 'Comment deleted successfully.',
                comments: populatedStory.comments,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('API Error during comment deletion:', error);
        return NextResponse.json(
            { message: 'Failed to delete comment.', error: (error as Error).message },
            { status: 500 }
        );
    }
}