import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";
import mongoose from 'mongoose';
import StoryModule from "@/models/storyModel.js"

const Story = StoryModule as any

connect();

export async function POST(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Login required to rate a story." }, { status: 401 });
        }

        const { storyId, rating } = await request.json();

        if (!storyId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ message: 'Invalid storyId or rating (must be 1-5).' }, { status: 400 });
        }

        const story = await Story.findById(storyId);

        if (!story) {
            return NextResponse.json({ message: "Story not found." }, { status: 404 });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        const existingRatingIndex = story.ratings.findIndex(
            (r: any) => r.userId.equals(userObjectId)
        );

        let totalRatingSum = story.averageRating * story.ratingCount;

        if (existingRatingIndex > -1) {
            const oldRating = story.ratings[existingRatingIndex].rating;
            totalRatingSum = totalRatingSum - oldRating + rating;
            story.ratings[existingRatingIndex].rating = rating;
        } else {
            totalRatingSum += rating;
            story.ratings.push({ userId: userObjectId, rating: rating });
            story.ratingCount = story.ratings.length;
        }

        if (story.ratingCount > 0) {
            story.averageRating = parseFloat((totalRatingSum / story.ratingCount).toFixed(1));
        } else {
            story.averageRating = 0;
        }

        await story.save();

        return NextResponse.json(
            {
                message: 'Rating submitted successfully.',
                averageRating: story.averageRating,
                ratingCount: story.ratingCount,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('API Error during story rating:', error);
        return NextResponse.json(
            { message: 'Failed to submit rating.', error: error.message },
            { status: 500 }
        );
    }
}