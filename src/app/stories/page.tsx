"use client"

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import NormalUser from '../components/stories/NormalUser';
import Admin from '../components/stories/Admin';


interface Story {
  _id: string;
  title: string;
  description: string; 
  content: string;
  genre: string; 
  coverImage: string; 
  createdAt: string;
  rating: number;
  published: boolean;
  isSeries?: boolean;
  seriesName?: string;
  averageRating: number;
  ratingCount: number;
}


export default function StoriesPage() {
    const { data: session, status } = useSession();
    const [user,setUser] = useState<{isAdmin: boolean }| null>(null)
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

     useEffect(() => {
        const checkAuth = async () => {
          const nextAuthToken = (session as any)?.token;
          const config = nextAuthToken
            ? { headers: { Authorization: `Bearer ${nextAuthToken}` } }
            : {};
            try {
                const response = await axios.get('/api/users/me',config);
                setUser(response.data.user);
            } catch (error) {
                setUser(null);
            }
        };
        if (status !== 'loading') {
        checkAuth();
        }
    }, [status , session]);


    useEffect(()=>{
      const fetchStories = async () => {
        setLoading(true);
        const nextAuthToken = (session as any)?.token;
        const config = nextAuthToken ? { headers: { Authorization: `Bearer ${nextAuthToken}` } } : {};
        try {
          const response = await axios.get('/api/stories/fetch-data',config);
          const fetchedStories : Story[] = response.data.stories.map((s:any) => ({
            _id: s._id,
            title: s.title,
            description: s.description,
            content: s.content,
            genre: s.category || "uncategorized",
            coverImage: s.coverImage,
            createdAt: s.createdAt,
            rating: s.rating || parseFloat((3 + Math.random() * 2).toFixed(1)),
            published: s.isPublished ,
            isSeries: s.isSeries,
            seriesName: s.seriesName,
            averageRating: s.averageRating, 
            ratingCount: s.ratingCount || 0,
          }))
          setStories(fetchedStories);
          
        } catch (error) {
          console.error("Failed to fetch stories:", error);
          setStories([]);
        } finally {
          setLoading(false);
        }
      }
      fetchStories();
    },[session])

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen  flex items-center justify-center text-[#B7860B] text-2xl font-serif">
                <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Stories...
            </div>
        );
    }


    const isUserAdmin = user && user.isAdmin;


    

  return (
    <div>
      {isUserAdmin ? (
        <Admin stories={stories} />
      ) : (
        <NormalUser stories={stories} />
      )}
    </div>
  );
}