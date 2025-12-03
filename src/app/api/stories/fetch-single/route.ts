// src/app/api/stories/fetch-single/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { connect } from "@/dbConfig/dbConfig";
import Story from '@/models/storyModel.js';
import User from '@/models/userModel.js';
import { getDataFromToken } from '@/utils/authMiddleware';

connect();

export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        const url = new URL(request.url);
        const storyId = url.searchParams.get('id');


        if (!storyId) {
            return NextResponse.json(
                { success: false, message: 'Story ID is required.' },
                { status: 400 }
            );
        }

        // --- UPDATED POPULATION LOGIC for nested replies ---
        let story = await Story.findById(storyId).populate([
            {
                path: 'comments.userId',
                select: 'name username profileImage'
            },
            {
                path: 'comments.replies.userId', // New: Populate user data for nested replies
                select: 'name username profileImage'
            }
        ]);
        // --- END UPDATED POPULATION LOGIC ---

        if (!story) {
            return NextResponse.json(
                { success: false, message: 'Story not found.' },
                { status: 404 }
            );
        }

        // Admin check (re-enabled for security)
        if (!story.isPublished) {
            if (!userId) {
                return NextResponse.json({ success: false, message: "Unauthorized access." }, { status: 401 });
            }
            const user = await User.findById(userId).select("isAdmin");
            if (!user || !user.isAdmin) {
                return NextResponse.json({ success: false, message: "Forbidden: Only Admin can view drafts." }, { status: 403 });
            }
        }
        
        return NextResponse.json({ story }, { status: 200 });

    } catch (error) {
        console.error('Error fetching single story:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching story', error: error.message },
            { status: 500 }
        );
    }
}