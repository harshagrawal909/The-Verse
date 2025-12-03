import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";
import TestimonialModule from "@/models/testimonialModel.js" 
import UserModule from '@/models/userModel.js';

const Testimonial = TestimonialModule as any;
const User = UserModule as any;

connect();

export async function POST(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Login required to submit an opinion." }, { status: 401 });
        }
        
        // --- NEW LOGIC: CHECK FOR EXISTING TESTIMONIAL ---
        const existingTestimonial = await Testimonial.findOne({ userId });
        if (existingTestimonial) {
            return NextResponse.json({ message: "You have already submitted an opinion. Only one submission per user is allowed." }, { status: 400 });
        }
        // --- END NEW LOGIC ---

        const { opinion, authorTitle, rating } = await request.json();

        if (!opinion || opinion.trim().length === 0) {
            return NextResponse.json({ message: 'Opinion text is required.' }, { status: 400 });
        }

        const user = await User.findById(userId).select("username name");
        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        const newTestimonial = await Testimonial.create({
            userId,
            authorName: user.name || user.username || "Anonymous User",
            opinion: opinion.trim(),
            authorTitle: authorTitle || "Verified Reader",
            rating: rating || 5,
            isPublished: false,
        });

        return NextResponse.json(
            {
                message: 'Thank you! Your opinion has been submitted for review.',
                testimonial: newTestimonial,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('API Error during testimonial submission:', error);
        return NextResponse.json(
            { message: 'Failed to submit opinion.', error: (error as Error).message },
            { status: 500 }
        );
    }
}