"use client";

import {useState,useMemo} from "react"

interface Story {
  _id: string;
  title: string;
  description: string;
  genre: string;
  coverImage: string;
  createdAt: string;
  isSeries?: boolean;
  seriesName?: string;
  averageRating: number;
  ratingCount: number;
}

interface NormalUserProps {
  stories?: Story[]; 
}

const WritingCard = ({ title, genre, description, image, storyId, isSeries, seriesName, averageRating, ratingCount}) => (
  <div className="bg-[#FDF4E2] text-[#1E2A28] p-6 rounded-2xl shadow-lg flex flex-col border border-[#E3D8B5] transition duration-300 hover:shadow-xl hover:-translate-y-1">
    
    
    <div className="w-full h-48 mb-4 rounded-md overflow-hidden">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
      />
    </div>

    <h3 className="text-2xl font-semibold mb-2 text-[#1E2A28]">{title}</h3>

    {isSeries && seriesName && (
      <p className="text-sm font-medium text-[#4E7C68] mb-1">
        Part of the **{seriesName}** series
      </p>
    )}

    <div className="flex items-center justify-between mb-3 text-sm font-medium">
      <span className="text-[#B7860B]">{genre} | 5 min read</span>
      <div className="flex items-center space-x-1 text-[#B7860B]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>
            {i < Math.floor(averageRating) ? '★' : i < averageRating ? '⯪' : '☆'}
          </span>
        ))}
        <span className="ml-1 text-xs text-[#3A3A37]">{averageRating.toFixed(1)} ({ratingCount})</span>
      </div>
    </div>
 
    
    <p className="text-[#3A3A37] text-sm mb-4 line-clamp-3 flex-grow">
      {description}
    </p>
    
    <a 
      href={`/writings/${storyId}`}
      className="text-[#B7860B] font-medium hover:underline self-start mt-auto"
    >
      Read More
    </a>
  </div>
);


export default function NormalUser({ stories = [] }: NormalUserProps) { 
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSeries, setSelectedSeries] = useState("All");  
  

  const seriesNames = useMemo(()=>{
    const series = stories
      .filter(s => s.isSeries && s.seriesName)
      .map(s => s.seriesName) as string[];
      return ["All", ...new Set(series)];
  },[stories])

  const genres = useMemo(
    () => ["All", ...new Set(stories.map((s) => s.genre))],
    [stories]
  );

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
  }, [stories, selectedGenre, sortBy, selectedSeries]);

  if (!stories.length) {
    return (
      <div className="min-h-screen bg-[#FEF8EC] flex items-center justify-center text-[#3C2A21] font-serif">
        <p>No stories found yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <section className="pt-12 rounded-t-3xl">
      <div className="max-w-6xl mx-auto px-8">

        <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-[#1E2A28] to-[#4E7C68] bg-clip-text text-transparent mb-4  pb-2">
            All Stories
            </h2>
            <p className="text-lg text-[#3A3A37] max-w-3xl mx-auto">
            Journey through worlds untold — from enchanted forests to forgotten
          galaxies. Choose your tale and lose yourself in The Verse.
            </p>
        </div>

        <div className="flex flex-wrap justify-between items-center mb-12  p-4  ">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredStories.map((story) => (
            <WritingCard 
                key={story._id} 
                title={story.title} 
                genre={story.genre} 
                description={story.description} 
                image={story.coverImage}
                storyId={story._id}
                isSeries={story.isSeries}
                seriesName={story.seriesName}
                averageRating={story.averageRating} 
                ratingCount={story.ratingCount}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
