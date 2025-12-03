// src/app/profile/page.tsx

"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Edit, LogOut, X, Camera } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  name?: string; 
}

// --- Image Upload Utility Function (Relies on /api/upload-image) ---
const uploadImage = async (file: File | null): Promise<string> => {
    if (!file) {
        throw new Error("No file provided for upload.");
    }

    const formData = new FormData();
    formData.append('coverFile', file); // API uses 'coverFile' field name

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
// --- End Upload Utility Function ---


// --- Component: EditProfileModal (for name/username update) ---
interface EditProfileModalProps {
    user: UserData;
    onClose: () => void;
    onUpdate: (updatedUser: UserData) => void;
    nextAuthToken: string | undefined;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onUpdate, nextAuthToken }) => {
    const [name, setName] = useState(user.name || '');
    const [username, setUsername] = useState(user.username);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);
        
        if (!name.trim() || !username.trim()) {
            setError("Display Name and Username are required.");
            setIsSaving(false);
            return;
        }

        const config = nextAuthToken 
            ? { headers: { Authorization: `Bearer ${nextAuthToken}` } }
            : {};
            
        try {
            const response = await axios.put(
                '/api/users/update-user-profile', // Existing API for name/username
                { name: name.trim(), username: username.trim() },
                config
            );
            
            alert(response.data.message);
            onUpdate(response.data.user); 
            onClose();

        } catch (err: any) {
            console.error("Profile update failed:", err);
            const message = err?.response?.data?.message || "Failed to save profile.";
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#050816]/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6 sm:p-8">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-2xl font-bold text-[#1E2A28]">Edit Profile Details</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                    
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
                    )}
                    
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[#1E2A28] mb-1">Display Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-[#E3D8B5] rounded-lg focus:ring-[#B7860B] focus:border-[#B7860B]"
                            disabled={isSaving}
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-[#1E2A28] mb-1">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border border-[#E3D8B5] rounded-lg focus:ring-[#B7860B] focus:border-[#B7860B]"
                            disabled={isSaving}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-[#1E2A28] mb-1">Email (Cannot be changed)</label>
                        <input
                            type="email"
                            value={user.email}
                            className="w-full px-3 py-2 border border-gray-100 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            readOnly
                        />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#B7860B] text-white font-semibold rounded-lg hover:bg-[#996C08] transition disabled:opacity-50 flex items-center"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// --- End Component: EditProfileModal ---


// --- NEW Component: EditPictureModal (for profile picture update) ---
interface EditPictureModalProps {
    user: UserData;
    onClose: () => void;
    onUpdate: (updatedUser: UserData) => void;
    nextAuthToken: string | undefined;
}

const EditPictureModal: React.FC<EditPictureModalProps> = ({ user, onClose, onUpdate, nextAuthToken }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatar || null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedFile) {
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
        return () => {
            if (previewUrl && previewUrl !== user.avatar) URL.revokeObjectURL(previewUrl);
        };
    }, [selectedFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!selectedFile) {
            setError("Please select a new image first.");
            return;
        }
        setIsSaving(true);
        
        const config = nextAuthToken 
            ? { headers: { Authorization: `Bearer ${nextAuthToken}` } }
            : {};
            
        try {
            // 1. Upload the image to Vercel/storage
            const uploadedUrl = await uploadImage(selectedFile);
            
            // 2. Update the user profile document with the new URL
            const response = await axios.put(
                '/api/users/update-profile-picture', // NEW API endpoint
                { profileImage: uploadedUrl },
                config
            );
            
            alert(response.data.message);
            onUpdate(response.data.user);
            onClose();

        } catch (err: any) {
            console.error("Picture update failed:", err);
            const message = err?.response?.data?.message || "Failed to upload or save picture.";
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#050816]/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6 sm:p-8">
                <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                    <h3 className="text-2xl font-bold text-[#1E2A28]">Update Profile Picture</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                    
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
                    )}
                    
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-32 h-32">
                            <img
                                src={previewUrl || "/images/user-avatar.png"}
                                alt="Profile Preview"
                                className="w-full h-full object-cover rounded-full border-4 border-[#B7860B]"
                            />
                            <Camera className="absolute bottom-0 right-0 p-1 bg-[#4E7C68] text-white rounded-full w-8 h-8"/>
                        </div>
                        
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-sm text-[#1E2A28] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                            disabled={isSaving}
                        />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#B7860B] text-white font-semibold rounded-lg hover:bg-[#996C08] transition disabled:opacity-50 flex items-center"
                            disabled={isSaving || !selectedFile}
                        >
                            {isSaving ? 'Uploading...' : 'Upload & Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// --- END Component: EditPictureModal ---


export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); 
  const [isEditingPicture, setIsEditingPicture] = useState(false); 

  const nextAuthToken = (session as any)?.token as string | undefined;

  // 1. Fetch User Data and Handle Auth
  useEffect(() => {
    if (status === 'loading') return;

    const fetchUser = async () => {
      setIsLoading(true);
      const config = nextAuthToken 
        ? { headers: { Authorization: `Bearer ${nextAuthToken}` } }
        : {};

      try {
        const response = await axios.get('/api/users/me', config);
        setUser(response.data.user);
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchUser();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, nextAuthToken, router]);


  // 2. Handle Logout
  const handleLogout = async () => {
    try {
        await axios.post('/api/users/logout');
        router.push('/');
    } catch (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. Please try again.");
    }
  };
  
  // 3. Handle User Data Update from Modal
  const handleUserUpdate = (updatedUser: UserData) => {
      setUser(updatedUser);
  };


  // --- Loading State ---
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#B7860B] text-2xl font-serif">
        <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading Profile...
      </div>
    );
  }

  if (!user) {
    return null; 
  }


  // --- Main Content ---
  const displayName = user.name || user.username || "Verified Reader";

  return (
    <div className="min-h-screen text-[#1E2A28] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">

        {isEditing && user && (
            <EditProfileModal 
                user={user} 
                onClose={() => setIsEditing(false)} 
                onUpdate={handleUserUpdate}
                nextAuthToken={nextAuthToken}
            />
        )}
        
        {isEditingPicture && user && ( 
            <EditPictureModal 
                user={user} 
                onClose={() => setIsEditingPicture(false)} 
                onUpdate={handleUserUpdate}
                nextAuthToken={nextAuthToken}
            />
        )}


        {/* Welcome Section */}
        <div className="bg-[#FEF8ECFF] p-8 sm:p-10 rounded-xl shadow-lg border border-[#E3D8B5] mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1E2A28] to-[#4E7C68] bg-clip-text text-transparent mb-2">
              Welcome Back, {displayName}!
            </h1>
            <p className="text-lg text-[#3A3A37] max-w-md">
              Your next adventure is waiting. Explore personalized recommendations or manage your preferences.
            </p>
          </div>
          <img
            src={user.avatar}
            alt={displayName}
            className="w-32 h-32 rounded-full object-cover border-4 border-[#B7860B] hidden sm:block"
          />
        </div>


        {/* Profile Details & Edit Button */}
        <div className="bg-[#FFFDF8] p-8 rounded-xl shadow-md border border-[#E3D8B5] mb-10">
            <div className="flex justify-between items-center mb-6 border-b border-[#E3D8B5] pb-3">
                <h2 className="text-2xl font-semibold text-[#1E2A28]">Your Profile</h2>
                <div className="flex space-x-4">
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="flex items-center text-[#4E7C68] hover:text-[#1E2A28] font-medium transition"
                    >
                        <Edit className="w-4 h-4 mr-1"/> Edit Details
                    </button>
                    <button 
                        onClick={() => setIsEditingPicture(true)} 
                        className="flex items-center text-[#B7860B] hover:text-[#996C08] font-medium transition"
                    >
                        <Camera className="w-4 h-4 mr-1"/> Change Picture
                    </button>
                </div>
            </div>
          
            <div className="flex items-center space-x-6">
                <img
                    src={user.avatar}
                    alt={displayName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#E3D8B5]"
                />
                <div>
                    <p className="text-xl font-semibold text-[#1E2A28]">{displayName}</p>
                    <p className="text-md text-[#3A3A37]">{user.email}</p>
                    <span className="text-sm font-medium text-[#B7860B] border border-[#B7860B]/50 px-2 py-0.5 mt-1 inline-block rounded-full">
                        {user.isAdmin ? "Administrator" : "Verified Member"}
                    </span>
                </div>
            </div>
            
            
        </div>

        {/* Privacy Settings / Actions */}
        <div className="bg-[#FFFDF8] p-8 rounded-xl shadow-md border border-[#E3D8B5]">
            <h2 className="text-2xl font-semibold text-[#1E2A28] mb-6 border-b border-[#E3D8B5] pb-3">Account Actions</h2>
            
            <div className="flex justify-between items-center mb-4">
                <p className="text-lg text-[#3A3A37]">Logout</p>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition flex items-center"
                >
                    <LogOut className="w-4 h-4 mr-1"/> Logout
                </button>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E3D8B5]">
                <p className="text-lg text-[#3A3A37]">Delete Account</p>
                <button
                    onClick={() => alert("Account deletion process initiated. Please contact support.")}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-red-500 hover:underline transition"
                >
                    Permanently Delete
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}