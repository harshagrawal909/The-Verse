"use client";

import Image from "next/image";
import Link from "next/link";
import {useState, useMemo} from "react";

interface Story {
  _id: string;
  title: string;
  description: string;
  genre: string;
  coverImage: string;
  createdAt: string;
  published: boolean;
  isSeries?: boolean;
  seriesName?: string;
  averageRating: number;
  ratingCount: number;
}

interface AdminProps {
  stories?: Story[]; 
}


const AdminCard = ({ story }: { story: Story }) => (
  <div className="bg-[#FDF4E2] text-[#1E2A28] p-4 rounded-xl shadow-lg flex flex-col border border-[#E3D8B5] transition duration-300 hover:shadow-xl hover:-translate-y-1">
    
    <div className="w-full h-40 mb-3 rounded-md overflow-hidden">
      <img 
        src={story.coverImage} 
        alt={story.title} 
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
      />
    </div>

    <h3 className="text-xl font-semibold mb-1 text-[#1E2A28] truncate">{story.title}</h3>

    {story.isSeries && story.seriesName && (
      <p className="text-xs font-medium text-[#4E7C68] mb-1 truncate">
        Series: **{story.seriesName}**
      </p>
    )}

    <div className="flex items-center justify-between mb-3 text-sm font-medium">
      <span className="text-[#B7860B]">{story.genre} | {story.published ? "published" : "Drafted"}</span>
      <div className="flex items-center space-x-1 text-[#B7860B]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>
            {i < Math.floor(story.averageRating) ? '★' : i < story.averageRating ? '⯪' : '☆'}
          </span>
        ))}
        <span className="ml-1 text-xs text-[#3A3A37]">{story.averageRating.toFixed(1)} ({story.ratingCount})</span>
      </div>
    </div>
    
    <p className="text-[#3A3A37] text-sm mb-4 line-clamp-3">
      {story.description}
    </p>

    <div className="flex gap-3 mt-auto">
      <Link 
        href={`/writings/${story._id}`}
        className="flex-1 text-center py-2 px-3 text-sm font-medium rounded-lg 
                   bg-[#4E7C68] text-white 
                   hover:bg-[#1E2A28] transition duration-300"
      >
        View Story
      </Link>
      
      <Link 
        href={`/admin/edit-story/${story._id}`} 
        className="flex-1 text-center py-2 px-3 text-sm font-medium rounded-lg 
                   border border-[#B7860B] text-[#B7860B] 
                   hover:bg-[#B7860B] hover:text-white transition duration-300"
      >
        Edit Story
      </Link>
    </div>
  </div>
);


export default function Admin({ stories = [] }: AdminProps) { 
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSeries, setSelectedSeries] = useState("All");  

  const genres = useMemo(
    () => ["All", ...new Set(stories.map((s) => s.genre))],
    [stories]
  );

  const seriesNames = useMemo(()=>{
    const series = stories
      .filter(s => s.isSeries && s.seriesName)
      .map(s => s.seriesName) as string[];
      return ["All", ...new Set(series)];
  },[stories])

  const filteredStories = useMemo(() => {
    let result = [...stories];
    if (selectedGenre !== "All") {
      result = result.filter((s) => s.genre === selectedGenre);
    }
    if (selectedSeries !== "All") {
      result = result.filter((s) => s.seriesName === selectedSeries);
    }
    if (sortBy === "popular") {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      );
    }

    return result;
  }, [stories, selectedGenre, sortBy,selectedSeries]);

  if (!stories.length) {
    return (
      <div className="min-h-screen bg-[#FEF8EC] flex items-center justify-center text-[#3C2A21] font-serif">
        <p>No stories found yet. Time to add one!</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen pt-12 ">
      <div className="max-w-6xl mx-auto px-8">

        <div className="flex justify-between items-start mb-12">
            <div>
                <h2 className="text-5xl font-bold bg-gradient-to-r from-[#1E2A28] to-[#4E7C68] bg-clip-text text-transparent mb-4 pb-2">
                    Manage Stories
                </h2>
                <p className="text-lg text-[#3A3A37] max-w-4xl">
                    As an administrator, you can view, edit, or add new stories to the portfolio. Dive into the world of creative narratives and ensure our collection is always fresh and engaging.
                </p>
            </div>
            
            <Link 
                href="/admin/add-story" 
                className="flex items-center px-6 py-3 text-lg font-semibold rounded-lg bg-[#B7860B] text-white shadow-md hover:bg-[#996C08] transition duration-300 whitespace-nowrap mt-2"
            >
                <span className="mr-2">+</span> Add Story
            </Link>
        </div>

        <div className="flex flex-wrap justify-between items-center mb-10 p-4 border-y border-[#E3D8B5]">
          <div className="flex items-center gap-4">
            <label className="text-[#3A3A37] font-medium">Filter by Genre:</label>
            <select
              className="px-3 py-2 bg-[#FEF8EC] border border-[#E3D8B5] rounded-lg text-[#1E2A28] focus:outline-none focus:ring-2 focus:ring-[#B7860B]"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {seriesNames.length > 1 && (
            <div className="flex items-center gap-4">
              <label className="text-[#3A3A37] font-medium">Filter By Series</label>
              <select
                  className="px-3 py-2 bg-[#FEF8EC] border border-[#E3D8B5] rounded-lg text-[#1E2A28] focus:outline-none focus:ring-2 focus:ring-[#B7860B]"
                  value={selectedSeries}
                  onChange={(e) => setSelectedSeries(e.target.value)}
                >
                  {seriesNames.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
              
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="text-[#3A3A37] font-medium">Sort by:</label>
            <select
              className="px-3 py-2 bg-[#FEF8EC] border border-[#E3D8B5] rounded-lg text-[#1E2A28] focus:outline-none focus:ring-2 focus:ring-[#B7860B]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

       
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          {filteredStories.map((story) => (
            <AdminCard 
                key={story._id} 
                story={story} 
            />
          ))}
        </div>

      </div>
    </section>
  );
}