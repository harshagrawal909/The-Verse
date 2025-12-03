import mongoose from "mongoose"

const testimonialSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    authorName: { 
        type: String,
        required: true
    },
    opinion: { 
        type: String,
        required: [true, "Opinion text is required"],
        maxlength: [500, "Opinion cannot exceed 500 characters"]
    },
    authorTitle: {
        type: String,
        default: "Verified Reader"
    },
    isPublished: {
        type: Boolean,
        default: false 
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    }
}, { timestamps: true });

const Testimonial = mongoose.models.testimonials || mongoose.model("testimonials", testimonialSchema);
export default Testimonial