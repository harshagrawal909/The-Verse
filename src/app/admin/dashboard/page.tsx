// src/app/admin/dashboard/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { CloudUpload, BookOpen, MessageSquare, Settings, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface ConfigData {
    heroTitle: string;
    heroSubtitle: string;
    aboutSummary: string;
    aboutBioLong: string;
    authorImageUrl: string;
}

interface UserData {
    id: string;
    avatar: string;
}

const FormInput = ({ label, name, value, onChange, placeholder = '' }) => (
    <div className="mb-6">
        <label htmlFor={name} className="block text-lg font-medium text-[#1E2A28] mb-2">
            {label}
        </label>
        <input
            type="text"
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 border border-[#E3D8B5] rounded-lg text-[#1E2A28] focus:ring-1 transition duration-200 shadow-sm"
        />
    </div>
);

const FormTextarea = ({ label, name, value, onChange, rows = 4, placeholder = '' }) => (
    <div className="mb-6">
        <label htmlFor={name} className="block text-lg font-medium text-[#1E2A28] mb-2">
            {label}
        </label>
        <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            className="w-full px-4 py-3 border border-[#E3D8B5] rounded-lg text-[#1E2A28] focus:ring-1 transition duration-200 shadow-sm"
        ></textarea>
    </div>
);

const AdminCard = ({ Icon, title, description, href }) => (
    <Link href={href} className="flex flex-col items-center justify-center p-8 bg-[#FDF4E2] rounded-xl shadow-lg border border-[#E3D8B5] transition duration-300 hover:shadow-xl hover:bg-[#FEF8EC]">
        <Icon className="w-12 h-12 text-[#B7860B] mb-3" />
        <h3 className="text-xl font-semibold text-[#1E2A28] mb-2">{title}</h3>
        <p className="text-center text-sm text-[#3A3A37]">{description}</p>
    </Link>
);


export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [configData, setConfigData] = useState<ConfigData>({
        heroTitle: '',
        heroSubtitle: '',
        aboutSummary: '',
        aboutBioLong: '',
        authorImageUrl: '',
    });

    // NEW STATE: For the file selected for the About Page Author Image
    const [newAuthorImageFile, setNewAuthorImageFile] = useState<File | null>(null);

    const [userData, setUserData] = useState<UserData | null>(null);
    const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const nextAuthToken = (session as any)?.token; // Use type assertion for session token

    // 1. Initial Fetch (User and Config)
    useEffect(() => {
        if (status === 'loading') return;
        
        const fetchData = async () => {
            setError(null);
            const config = nextAuthToken ? { headers: { Authorization: `Bearer ${nextAuthToken}` } } : {};
            
            try {
                // Fetch User Data (for isAdmin check and current profile picture)
                const userResponse = await axios.get('/api/users/me', config);
                const fetchedUser = userResponse.data.user;
                if (!fetchedUser.isAdmin) {
                    router.push('/stories'); // Redirect non-admins
                    return;
                }
                setUserData(fetchedUser);
                
                // Fetch Global Config Data
                const configResponse = await axios.get('/api/admin/config');
                setConfigData(configResponse.data.config);

            } catch (err) {
                console.error("Dashboard Load Error:", err);
                // Assume 401/403 means user is not admin or token expired
                router.push('/login'); 
                setError("Failed to load dashboard. Please log in as an administrator.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [status, nextAuthToken, router]);

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setConfigData(prev => ({ ...prev, [name]: value }));
    };

    const uploadImage = async (file: File | null): Promise<string> => {
        if (!file) {
            // Return empty string or current image URL, but for config fields
            // it's safer to ensure a file is always passed if uploading
            throw new Error("No file provided for upload.");
        }

        const formData = new FormData();
        formData.append('coverFile', file); 

        try {
            const response = await fetch('/api/upload-image', { 
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Image upload failed.');
            }

            const data = await response.json();
            return data.url; 

        } catch (error) {
            console.error("Upload failed:", error);
            throw new Error(`Image upload failed: ${(error as Error).message}`);
        }
    };
    
    // 2. Profile Picture Update Logic (Remains the same)
    const handleProfileImageUpdate = async () => {
        if (!newProfileImageFile || !userData) return;

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            const uploadedUrl = await uploadImage(newProfileImageFile);
            
            const config = nextAuthToken ? { headers: { Authorization: `Bearer ${nextAuthToken}` } } : {};
            
            // The /api/users/update-profile API is restricted to Admins (by your route.ts logic)
            const response = await axios.put('/api/users/update-profile', { profileImage: uploadedUrl }, config);

            // Update local state and success message
            setUserData(prev => prev ? { ...prev, avatar: uploadedUrl } : null);
            setNewProfileImageFile(null);
            setSuccessMessage("Profile picture updated successfully!");
            
        } catch (err) {
            setError((err as Error).message || "Failed to update profile picture.");
        } finally {
            setIsSaving(false);
        }
    };

    // 3. Global Config Update Logic (MODIFIED)
    const handleConfigSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            let updatedConfigData = { ...configData };

            // --- 1. Handle Author Image Upload if a new file is present ---
            if (newAuthorImageFile) {
                setSuccessMessage("Uploading new author image...");
                const uploadedUrl = await uploadImage(newAuthorImageFile);
                
                // Update the data to be saved with the new URL
                updatedConfigData.authorImageUrl = uploadedUrl; 
                
                // Clear the file state after successful upload
                setNewAuthorImageFile(null);
            }
            // --- End Image Upload ---

            const config = nextAuthToken ? { headers: { Authorization: `Bearer ${nextAuthToken}` } } : {};
            
            // --- 2. Save the Configuration (including the potentially new URL) ---
            const response = await axios.put('/api/admin/config', updatedConfigData, config);

            // Update local state with fresh data and show success
            setConfigData(response.data.config);
            setSuccessMessage("Global site configuration saved successfully!");

        } catch (err) {
            setError((err as any).response?.data?.message || "Failed to save configuration.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[#B7860B] text-2xl font-serif">
                <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Admin Dashboard...
            </div>
        );
    }
    
    if (!userData) return null;


    return (
        <div className="min-h-screen text-[#1E2A28] py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-8">

                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1E2A28] to-[#4E7C68] bg-clip-text text-transparent mb-10 pb-2 flex items-center">
                    <Settings className="w-8 h-8 mr-3 text-[#4E7C68]" /> Admin Dashboard
                </h1>

                {isSaving && (
                    <div className="flex items-center justify-center p-4 mb-6 text-[#B7860B] rounded-lg border border-[#B7860B] shadow-inner">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#B7860B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving changes...
                    </div>
                )}
                {error && (
                    <div className="p-4 mb-6 bg-red-100 text-red-800 rounded-lg border border-red-300 shadow-sm">
                        <p className="font-semibold">Error:</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 mb-6 bg-green-100 text-green-800 rounded-lg border border-green-300 shadow-sm">
                        <p className="font-semibold">Success:</p>
                        <p className="text-sm">{successMessage}</p>
                    </div>
                )}

                {/* MANAGEMENT LINKS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <AdminCard
                        Icon={BookOpen}
                        title="Manage Stories"
                        description="View, edit, or delete all published and drafted stories."
                        href="/stories" 
                    />
                    <AdminCard
                        Icon={MessageSquare}
                        title="Manage Testimonials"
                        description="Approve, unpublish, or delete reader opinions."
                        href="/about#admin-manager" 
                    />
                    <div className="p-8 bg-gray-100 rounded-xl shadow-inner border border-gray-200 flex flex-col justify-center items-center">
                        <span className="text-lg font-medium text-[#1E2A28]">Configuration Settings</span>
                        <span className="text-sm text-[#3A3A37] mt-1">Status: Online</span>
                    </div>
                </div>


                {/* ADMIN PROFILE IMAGE MANAGER */}
                <div className="bg-[#FEF8ECFF] p-6 sm:p-8 rounded-xl shadow-lg border border-[#E3D8B5] mb-12">
                    <h2 className="text-2xl font-semibold text-[#1E2A28] pb-2 flex items-center">
                        <UserIcon className='w-5 h-5 mr-2' /> Admin Profile Picture
                    </h2>
                    <p className='text-[#1E2A28] mb-6 border-b border-[#E3D8B5] pb-2'>Change the profile picture displayed in the header dropdown.</p>

                    <div className="flex items-center space-x-8">
                        <div className="flex flex-col items-center">
                            <p className="text-sm text-[#3A3A37] mb-2">Current Image</p>
                            <img 
                                src={userData.avatar} 
                                alt="Admin Profile"
                                width="100"
                                height="100"
                                className="rounded-full object-cover border-4 border-[#B7860B]" // Added border for style consistency
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-lg font-medium text-[#1E2A28] mb-2">Upload New Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setNewProfileImageFile(e.target.files ? e.target.files[0] : null)}
                                className="w-full text-sm text-[#1E2A28] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#B7860B] file:text-white hover:file:bg-[#996C08]"
                            />
                            {newProfileImageFile && (
                                <p className="text-sm text-[#4E7C68] mt-2">Selected: {newProfileImageFile.name}</p>
                            )}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleProfileImageUpdate}
                        className="mt-6 px-6 py-3 text-lg font-semibold rounded-lg bg-[#4E7C68] text-white hover:bg-[#1E2A28] transition duration-300 shadow-md disabled:opacity-50"
                        disabled={isSaving || !newProfileImageFile}
                    >
                        {isSaving ? 'Uploading...' : 'Update Profile Picture'}
                    </button>
                </div>


                {/* GLOBAL CONTENT MANAGER */}
                <div className="bg-[#FEF8ECFF] p-6 sm:p-8 rounded-xl shadow-lg border border-[#E3D8B5]">
                    <h2 className="text-2xl font-semibold text-[#1E2A28] pb-2">Global Site Content</h2>
                    <p className='text-[#1E2A28] mb-8 border-b border-[#E3D8B5] pb-2'>Customize the main text blocks across the site.</p>

                    <h3 className="text-xl font-semibold text-[#B7860B] mb-4">Home Page (Hero Section)</h3>
                    <FormInput 
                        label="Hero Title"
                        name="heroTitle"
                        value={configData.heroTitle}
                        onChange={handleConfigChange}
                        placeholder="Welcome to The Verse"
                    />
                    <FormTextarea 
                        label="Hero Subtitle"
                        name="heroSubtitle"
                        value={configData.heroSubtitle}
                        onChange={handleConfigChange}
                        rows={3}
                        placeholder="A short, captivating description of the site."
                    />

                    <div className='border-b border-[#E3D8B5] my-10 '></div>

                    <h3 className="text-xl font-semibold text-[#B7860B] mb-4">About Page (Author & Bio)</h3>
                    
                    {/* --- NEW AUTHOR IMAGE UPLOAD SECTION --- */}
                    <div className="mb-8 p-4 bg-white rounded-lg border border-[#E3D8B5] shadow-sm">
                        <label className="block text-lg font-medium text-[#1E2A28] mb-4">
                            Author Image for About Page
                        </label>
                        
                        <div className="flex items-center space-x-6">
                            <div className="flex flex-col items-center">
                                <p className="text-sm text-[#3A3A37] mb-2">Current Image</p>
                                <img 
                                    src={configData.authorImageUrl || "/images/admin.jpg"}
                                    alt="Current Author"
                                    width="100"
                                    height="100"
                                    className="w-24 h-24 object-cover rounded-md border-2 border-[#B7860B]"
                                />
                                <p className="text-xs text-[#3A3A37] mt-1 truncate max-w-[100px]">
                                    {configData.authorImageUrl ? 'URL set' : 'Default'}
                                </p>
                            </div>
                            
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewAuthorImageFile(e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-sm text-[#1E2A28] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4E7C68] file:text-white hover:file:bg-[#1E2A28]"
                                />
                                {newAuthorImageFile && (
                                    <p className="text-sm text-[#4E7C68] mt-2">Selected: {newAuthorImageFile.name}</p>
                                )}
                                <p className="text-xs text-[#3A3A37] mt-1">
                                    Select a new image here. It will be uploaded and saved when you click "Save Global Config".
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* --- END NEW AUTHOR IMAGE UPLOAD SECTION --- */}


                    <FormTextarea 
                        label="About Page Summary (First Paragraph)"
                        name="aboutSummary"
                        value={configData.aboutSummary}
                        onChange={handleConfigChange}
                        rows={3}
                        placeholder="A short summary of the author."
                    />
                    <FormTextarea 
                        label="About Page Full Biography"
                        name="aboutBioLong"
                        value={configData.aboutBioLong}
                        onChange={handleConfigChange}
                        rows={10}
                        placeholder="The full, detailed biography text (use line breaks for paragraphs)."
                    />

                    <div className="flex justify-end pt-8">
                        <button
                            onClick={handleConfigSave}
                            className="px-6 py-3 text-lg font-semibold rounded-lg bg-[#B7860B] text-white hover:bg-[#996C08] transition duration-300 shadow-md disabled:opacity-50"
                            disabled={isSaving}
                        >
                            Save Global Config
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}