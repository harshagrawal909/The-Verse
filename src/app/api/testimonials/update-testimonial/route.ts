import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/utils/authMiddleware";
import TestimonialModule from "@/models/testimonialModel.js" 
import UserModule from '@/models/userModel.js';

const Testimonial = TestimonialModule as any;
const User = UserModule as any;

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
            id,
            opinion,
            authorTitle,
            rating,
            isPublished // Can update status
        } = body;

        if (!id || !opinion) {
            return NextResponse.json(
                { message: 'Testimonial ID and opinion are required for update.' },
                { status: 400 }
            );
        }

        const updateData: any = {
            opinion: opinion.trim(),
            authorTitle: authorTitle || "Verified Reader",
            rating: rating,
            isPublished: isPublished !== undefined ? isPublished : false,
        };

        const updatedTestimonial = await Testimonial.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true } 
        );

        if (!updatedTestimonial) {
            return NextResponse.json({ message: "Testimonial not found for update." }, { status: 404 });
        }

        return NextResponse.json(
            {
                message: 'Testimonial updated successfully.',
                testimonial: updatedTestimonial
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('API Error during testimonial update:', error);
        return NextResponse.json(
            { message: 'Failed to update testimonial.', error: (error as Error).message },
            { status: 500 }
        );
    }
}