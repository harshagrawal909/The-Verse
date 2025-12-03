
"use client"
import { Mail, Phone, MapPin, Instagram, Linkedin, Github, Star, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import Link from "next/link";
import Image from 'next/image'; 
import TestimonialSubmission from '../components/testimonials/TestimonialSubmission';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface Testimonial {
    _id: string;
    authorName: string;
    opinion: string;
    authorTitle: string;
    rating: number;
    isPublished: boolean; 
}

interface ConfigData {
    aboutSummary: string;
    aboutBioLong: string;
    authorImageUrl: string;
}

const displayStaticStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
        stars.push(<Star key={i} className="w-5 h-5 text-[#B7860B]" fill="#B7860B" />);
    }
    for (let i = fullStars; i < 5; i++) {
        stars.push(<Star key={i} className="w-5 h-5 text-[#E3D8B5]" fill="none" />);
    }
    return stars;
};

const AdminTestimonialManager = ({ allTestimonials, fetchAllTestimonials, fetchPublishedTestimonials, nextAuthToken }) => {
    
    const [isUpdating, setIsUpdating] = useState(false);
    
    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this testimonial?")) return;
        setIsUpdating(true);
        try {
            await axios.delete(`/api/testimonials/delete-testimonial?id=${id}`, {
                headers: { Authorization: `Bearer ${nextAuthToken}` }
            });
            alert("Testimonial deleted successfully!");
            fetchAllTestimonials();
            fetchPublishedTestimonials(); 
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete testimonial.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleTogglePublish = async (testimonial: Testimonial) => {
        setIsUpdating(true);
        try {
            await axios.put(`/api/testimonials/update-testimonial`, 
                { 
                    id: testimonial._id,
                    opinion: testimonial.opinion,
                    authorTitle: testimonial.authorTitle,
                    rating: testimonial.rating,
                    isPublished: !testimonial.isPublished 
                },
                { headers: { Authorization: `Bearer ${nextAuthToken}` } }
            );
            alert(`Testimonial successfully ${testimonial.isPublished ? 'unpublished' : 'published'}!`);
            fetchAllTestimonials();
            fetchPublishedTestimonials(); 
        } catch (error) {
            console.error("Publish toggle failed:", error);
            alert("Failed to update testimonial status.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    return (
        <div id="admin-manager" className="mt-20 p-8 bg-[#FFFDF8] rounded-xl shadow-2xl border border-[#B7860B]/50">
            <h2 className="text-3xl font-bold text-[#B7860B] mb-6">Admin Testimonial Management</h2>
            <p className="text-[#3A3A37] mb-6">Review and manage all submitted reader opinions (newest first). Total: {allTestimonials.length}</p>

            <div className="space-y-4">
                {allTestimonials.map((t) => (
                    <div key={t._id} className={`p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center ${t.isPublished ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 text-sm font-semibold">
                                {displayStaticStars(t.rating)}
                                <span className={t.isPublished ? 'text-green-700' : 'text-red-700'}>
                                    {t.isPublished ? 'PUBLISHED' : 'UNAPPROVED'}
                                </span>
                            </div>
                            <p className="text-lg italic text-[#1E2A28] mt-1 line-clamp-2">&quot;{t.opinion}&quot;</p>
                            <p className="text-sm text-[#3A3A37] mt-1">- {t.authorName}, {t.authorTitle}</p>
                        </div>
                        
                        <div className="flex space-x-3 mt-3 sm:mt-0 ml-0 sm:ml-4">
                            <button
                                onClick={() => handleTogglePublish(t)}
                                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors flex items-center ${t.isPublished ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                disabled={isUpdating}
                            >
                                {t.isPublished ? <XCircle className="w-4 h-4 mr-1"/> : <CheckCircle className="w-4 h-4 mr-1"/>}
                                {t.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                                onClick={() => handleDelete(t._id)}
                                className="px-3 py-1 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                                disabled={isUpdating}
                            >
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {allTestimonials.length === 0 && <p className="text-center text-[#3A3A37] italic mt-4">No submissions found.</p>}
        </div>
    );
};


export default function AboutPage() {
    const { data: session, status } = useSession();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]); 
    const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [config, setConfig] = useState<ConfigData>({
        aboutSummary: 'Loading summary...',
        aboutBioLong: 'Loading bio...',
        authorImageUrl: ''
    });
    
    const icon_size=24;
    const nextAuthToken = (session as any)?.token;
    
    // 0. Fetch Global Config
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axios.get('/api/admin/config');
                setConfig(response.data.config);
            } catch (error) {
                console.error("Failed to fetch config:", error);
            }
        };

        fetchConfig();
    }, []);

    useEffect(() => {
        if (session?.user && nextAuthToken) {
            axios.get('/api/users/me', {
                headers: { Authorization: `Bearer ${nextAuthToken}` }
            }).then(response => {
                setIsAdmin(response.data.user.isAdmin);
            }).catch(() => {
                setIsAdmin(false);
            });
        }
    }, [session, nextAuthToken]);

    const fetchPublishedTestimonials = useCallback(async () => {
        try {
            const response = await axios.get('/api/testimonials/fetch-published');
            setTestimonials(response.data.testimonials);
        } catch (error) {
            console.error("Failed to fetch published testimonials:", error);
        }
    }, []);

    const fetchAllTestimonials = useCallback(async () => {
        if (!isAdmin || status === 'loading' || !nextAuthToken) return;
        
        try {
            const response = await axios.get('/api/testimonials/fetch-all', {
                 headers: { Authorization: `Bearer ${nextAuthToken}` }
            });
            setAllTestimonials(response.data.testimonials);
        } catch (error) {
            console.error("Failed to fetch all testimonials (Admin):", error);
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin, status, nextAuthToken]);

    useEffect(() => {
        fetchPublishedTestimonials();
    }, [fetchPublishedTestimonials]);
    
    useEffect(() => {
        if (isAdmin) {
            fetchAllTestimonials();
        } else {
             setIsLoading(false); 
        }
    }, [isAdmin, fetchAllTestimonials]);
    
    const bioParagraphs = config.aboutBioLong.split('\n').filter(p => p.trim() !== '');

    return (
        <div className=" min-h-screen py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                <header className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#1E2A28] to-[#4E7C68] bg-clip-text text-transparent">
                        About the Author
                    </h1>
                </header>

                <div className="bg-white p-8 lg:p-12 rounded-2xl shadow-xl border border-[#E3D8B5]">
                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        <div className="lg:w-3/4 text-[#3A3A37] text-lg leading-relaxed font-serif">
                            <p className="mb-6">
                                <strong>Harsh Agrawal</strong> is an aspiring software developer and creative technologist with a deep passion for building impactful digital experiences. {config.aboutSummary.trim()}
                            </p>
                            {bioParagraphs.map((paragraph, index) => (
                                <p key={index} className="mb-6">
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        <div className="lg:w-1/4 flex justify-center lg:justify-end">
                            <div className="relative w-full max-w-[250px] h-[300px] rounded-lg overflow-hidden shadow-lg border-4 border-[#E3D8B5]">
                                <img
                                    src={config.authorImageUrl }
                                    alt="The Author"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-20 mb-12">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-[#1E2A28] to-[#4E7C68] bg-clip-text text-transparent">
                        Connect with Me
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    <div className="lg:w-1/2 bg-white p-8 rounded-xl shadow-lg border border-[#E3D8B5]">
                        <h3 className="text-2xl font-semibold text-[#1E2A28] mb-6 border-b pb-2">Reach Out</h3>
                        <ul className="space-y-4 text-left text-[#3A3A37]">
                            <li className="flex items-center text-lg">
                                <Mail className="w-5 h-5 mr-3 text-[#B7860B]" />
                                <a href="mailto:harshagrawal5843@gmail.com" className="hover:text-[#4E7C68]" target='_blank'>
                                    harshagrawal6524@gmail.com
                                </a>
                            </li>
                            <li className="flex items-center text-lg">
                                <Phone className="w-5 h-5 mr-3 text-[#B7860B]" />
                                <a href="tel:+919571325320" className="hover:text-[#4E7C68]">
                                    +91 95713 25320
                                </a>
                            </li>
                            <li className="flex items-center text-lg">
                                <MapPin className="w-5 h-5 mr-3 text-[#B7860B]" />
                                <a
                                    href="https://www.google.com/maps?q=Bhubaneswar,+Odisha,+India"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#1E2A28] hover:text-[#4E7C68] transition"
                                >
                                    Bhubaneswar, Odisha, India
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="lg:w-1/2 bg-white p-8 rounded-xl shadow-lg border border-[#E3D8B5]">
                        <h3 className="text-2xl font-semibold text-[#1E2A28] mb-6 border-b pb-2">Follow My Journey</h3>
                        <div className="flex space-x-6 justify-center lg:justify-start">
                            <Link href="https://www.linkedin.com/in/harshagrawal42" target="_blank" aria-label="LinkedIn" className="hover:text-black">
                                <Linkedin size={icon_size} /> 
                            </Link>
                            <Link href="mailto:harshagrawal6524@gmail.com" target="_blank" aria-label="Mail" className="hover:text-black">
                                <Mail size={icon_size} /> 
                            </Link>
                            <Link href="https://www.instagram.com/storywritter___/" target="_blank" aria-label="Instagram" className="hover:text-black">
                                <Instagram size={icon_size} /> 
                            </Link>
                            <Link href="https://github.com/harshagrawal909" target="_blank" aria-label="GitHub" className="hover:text-black">
                                <Github size={icon_size} /> 
                            </Link>
                        </div>

                        <TestimonialSubmission onSubmissionSuccess={fetchPublishedTestimonials} />
                    </div>
                </div>


                <div className="text-center mt-20 mb-12">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-[#1E2A28] to-[#4E7C68] bg-clip-text text-transparent">
                        What Readers Say
                    </h2>
                </div>

                {isLoading && !isAdmin && (
                    <div className="text-center text-[#B7860B] text-lg">Loading published testimonials...</div>
                )}
                
                {!isLoading && testimonials.length === 0 && (
                    <div className="text-center text-[#3A3A37] text-lg">No published testimonials yet. Be the first to submit your opinion!</div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((review) => (
                        <div key={review._id} className="bg-white p-6 rounded-xl shadow-md border border-[#E3D8B5] flex flex-col">
                            <div className="flex space-x-1 mb-3">
                                {displayStaticStars(review.rating)}
                            </div>
                            <p className="text-[#3A3A37] text-md italic mb-4 flex-grow">
                                &quot;{review.opinion}&quot;
                            </p>
                            <p className="text-[#1E2A28] text-sm font-semibold mt-auto">
                                - {review.authorName}, {review.authorTitle}
                            </p>
                        </div>
                    ))}
                </div>
                
                {isAdmin && !isLoading && (
                    <AdminTestimonialManager 
                        allTestimonials={allTestimonials} 
                        fetchAllTestimonials={fetchAllTestimonials} 
                        fetchPublishedTestimonials={fetchPublishedTestimonials}
                        nextAuthToken={nextAuthToken} 
                    />
                )}

            </div>
        </div>
    );
}