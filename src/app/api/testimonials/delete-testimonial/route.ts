import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";
import TestimonialModule from "@/models/testimonialModel.js" 
import UserModule from '@/models/userModel.js';

const Testimonial = TestimonialModule as any;
const User = UserModule as any;

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
        const testimonialId = url.searchParams.get('id');

        if (!testimonialId) {
            return NextResponse.json(
                { success: false, message: 'Testimonial ID is required for deletion.' },
                { status: 400 }
            );
        }

        const deletedTestimonial = await Testimonial.findByIdAndDelete(testimonialId);

        if (!deletedTestimonial) {
            return NextResponse.json({ message: "Testimonial not found for deletion." }, { status: 404 });
        }

        return NextResponse.json(
            {
                message: 'Testimonial deleted successfully.',
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('API Error during testimonial deletion:', error);
        return NextResponse.json(
            { message: 'Failed to delete testimonial.', error: (error as Error).message },
            { status: 500 }
        );
    }
}