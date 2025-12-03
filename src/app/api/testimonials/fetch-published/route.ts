import { NextResponse, NextRequest } from "next/server";
import TestimonialModule from "@/models/testimonialModel.js"
import { connect } from "@/dbConfig/dbConfig";

const Testimonial = TestimonialModule as any

connect();

export async function GET(request: NextRequest) {
    try {
        const testimonials = await Testimonial.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .limit(10); 

        return NextResponse.json({ testimonials }, { status: 200 });

    } catch (error) {
        console.error('Error fetching testimonials:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching testimonials', error: (error as Error).message },
            { status: 500 }
        );
    }
}