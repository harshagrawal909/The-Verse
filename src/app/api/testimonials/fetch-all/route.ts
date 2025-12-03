import { NextResponse, NextRequest } from "next/server";
import Testimonial from "@/models/testimonialModel.js"
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";
import User from '@/models/userModel.js';

connect();

export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized access" }, { status: 401 });
        }

        const user = await User.findById(userId).select("isAdmin");
        if (!user || !user.isAdmin) {
             return NextResponse.json({ message: "Forbidden: Only Admin can fetch all testimonials." }, { status: 403 });
        }
        
        const testimonials = await Testimonial.find({})
            .sort({ createdAt: -1 });

        return NextResponse.json({ testimonials }, { status: 200 });

    } catch (error) {
        console.error('Error fetching all testimonials:', error);
        return NextResponse.json(
            { success: false, message: 'Error fetching testimonials', error: (error as Error).message },
            { status: 500 }
        );
    }
}