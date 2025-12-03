"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Send, Star } from 'lucide-react';

interface TestimonialSubmissionProps {
    onSubmissionSuccess: () => void;
}

const TestimonialSubmission: React.FC<TestimonialSubmissionProps> = ({ onSubmissionSuccess }) => {
    const { data: session, status } = useSession();
    const [opinion, setOpinion] = useState('');
    const [authorTitle, setAuthorTitle] = useState('Verified Reader');
    const [rating, setRating] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    const isSubmittingEnabled = status === 'authenticated' && !isLoading && opinion.trim().length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSubmittingEnabled) return;

        setIsLoading(true);
        setMessage('');

        const nextAuthToken = (session as any)?.token;
        const config = nextAuthToken 
            ? { headers: { Authorization: `Bearer ${nextAuthToken}` } } 
            : {};

        try {
            const response = await axios.post(
                '/api/testimonials/add-testimonial', 
                { opinion, authorTitle, rating },
                config
            );
            
            setMessage(response.data.message);
            setOpinion('');
            setAuthorTitle('Verified Reader');
            setRating(5);
            onSubmissionSuccess(); 
        } catch (error) {
            console.error("Testimonial submission failed:", error);
            const errorMessage = (error as any).response?.data?.message || "Failed to submit opinion. Please try again.";
            setMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (status === 'loading') {
        return <p className="text-center text-[#3A3A37] italic">Loading authentication status...</p>;
    }

    if (status === 'unauthenticated') {
        return (
            <div className="text-center p-6 mt-8 bg-yellow-50 border border-yellow-200 rounded-lg text-[#1E2A28]">
                <p className="text-lg font-medium">Want to share your opinion?</p>
                <p className="text-sm mt-1">Please **log in** to submit your testimonial.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <h4 className="text-xl font-semibold text-[#1E2A28] border-b border-[#E3D8B5] pb-2">Share Your Opinion</h4>

            <div className="flex items-center space-x-2">
                <label className="text-md font-medium text-[#3A3A37]">Your Rating:</label>
                <div 
                    className="flex space-x-1"
                    onMouseLeave={() => setHoverRating(0)}
                >
                    {Array.from({ length: 5 }).map((_, index) => {
                        const ratingValue = index + 1;
                        const isFilled = ratingValue <= (hoverRating || rating);
                        
                        return (
                            <Star
                                key={index}
                                size={20}
                                className={`cursor-pointer transition-colors ${isFilled ? 'text-[#B7860B]' : 'text-[#E3D8B5]'}`}
                                onClick={() => setRating(ratingValue)}
                                onMouseEnter={() => setHoverRating(ratingValue)}
                                fill={isFilled ? '#B7860B' : 'none'}
                            />
                        );
                    })}
                </div>
            </div>

            <div>
                <textarea
                    placeholder="Write your honest opinion about the author's work here (max 500 characters)..."
                    rows={4}
                    value={opinion}
                    onChange={(e) => setOpinion(e.target.value)}
                    maxLength={500}
                    className="w-full p-4 border border-[#E3D8B5] rounded-lg focus:ring-1 focus:ring-[#B7860B] bg-white text-[#1E2A28]"
                    required
                ></textarea>
                <p className="text-right text-xs text-[#3A3A37]">{opinion.length}/500 characters</p>
            </div>
            
            <div>
                <label className="text-sm font-medium text-[#1E2A28] mb-1 block">Your Title (e.g., Avid Reader):</label>
                <input
                    type="text"
                    value={authorTitle}
                    onChange={(e) => setAuthorTitle(e.target.value)}
                    placeholder="Verified Reader"
                    className="w-full p-2 border border-[#E3D8B5] rounded-lg bg-white text-[#1E2A28] text-sm"
                />
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    className="px-6 py-2 bg-[#4E7C68] text-white rounded-lg hover:bg-[#1E2A28] transition duration-150 flex items-center disabled:opacity-50"
                    disabled={!isSubmittingEnabled}
                >
                    <Send className="w-4 h-4 mr-2" />
                    {isLoading ? 'Submitting...' : 'Submit Opinion'}
                </button>
            </div>

            {message && (
                <p className={`text-center text-sm font-medium ${message.startsWith("Thank you") ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
        </form>
    );
};

export default TestimonialSubmission;