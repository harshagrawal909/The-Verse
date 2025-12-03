"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface Story {
  _id: string;
  title: string;
  genre: string;
  description: string;
  coverImage: string;
  isFeatured: boolean;
  averageRating: number;
  ratingCount: number;
}

const WritingCard = ({
  title,
  genre,
  description,
  image,
  storyId,
  averageRating,
  ratingCount,
}) => (
  <div className="bg-[#FDF4E2] text-[#1E2A28] p-6 rounded-2xl shadow-lg flex flex-col border border-[#E3D8B5] transition duration-300 hover:shadow-xl hover:-translate-y-1">
    <div className="w-full h-48 mb-4 rounded-md overflow-hidden">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
      />
    </div>

    <h3 className="text-2xl font-semibold mb-2 text-[#1E2A28]">{title}</h3>

    <div className="flex items-center justify-between mb-3 text-sm font-medium">
      <span className="text-[#B7860B]">{genre}</span>
      <div className="flex items-center space-x-1 text-[#B7860B]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>
            {i < Math.floor(averageRating)
              ? "★"
              : i < averageRating
              ? "⯪"
              : "☆"}
          </span>
        ))}
        <span className="ml-1 text-xs text-[#3A3A37]">
          {averageRating.toFixed(1)} ({ratingCount})
        </span>
      </div>
    </div>

    <p className="text-[#3A3A37] text-sm mb-4 line-clamp-3 flex-grow">
      {description}
    </p>

    <Link
      href={`/writings/${storyId}`}
      className="text-[#B7860B] font-medium hover:underline self-start mt-auto"
    >
      Read More
    </Link>
  </div>
);

const FeaturedWritings = () => {
  const [recentStories, setRecentStories] = useState<Story[]>([]); // Renamed state for clarity
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentStories = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/stories/fetch-data");
        const stories: Story[] = response.data.stories
          .map((s: any) => ({
            _id: s._id,
            title: s.title,
            description: s.description,
            genre: s.category || "uncategorized",
            coverImage: s.coverImage,
            isFeatured: s.isFeatured,
            averageRating: s.averageRating || 4.2,
            ratingCount: s.ratingCount || 78,
          }))
          // The API already sorts by newest first (createdAt: -1).
          // We simply slice the top 3 stories.
          .slice(0, 3);
        setRecentStories(stories);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
        setRecentStories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentStories();
  }, []);

  if (isLoading) {
    return (
      <section className="pt-12 rounded-t-3xl">
        <div className="max-w-6xl mx-auto px-8 py-20 text-center text-[#B7860B] text-xl font-serif">
          <svg
            className="animate-spin h-8 w-8 mr-3 inline"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading recent writings...
        </div>
      </section>
    );
  }

  if (recentStories.length === 0) {
    return (
      <section className="pt-12 rounded-t-3xl">
        <div className="max-w-6xl mx-auto px-8 text-center text-[#3A3A37] py-16">
          <p className="text-xl">No published stories found yet. Check back later!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-12 rounded-t-3xl">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-[#1E2A28] to-[#4E7C68] bg-clip-text text-transparent mb-4 pb-2">
            Recent Stories
          </h2>
          <p className="text-lg text-[#3A3A37] max-w-3xl mx-auto">
            Check out the newest additions to The Verse. These are the latest tales fresh off the press.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {recentStories.map((writing) => (
            <WritingCard
              key={writing._id}
              title={writing.title}
              genre={writing.genre}
              description={writing.description}
              image={writing.coverImage}
              storyId={writing._id}
              averageRating={writing.averageRating}
              ratingCount={writing.ratingCount}
            />
          ))}
        </div>

        <div className="text-center mt-16">
          <a
            href="/stories"
            className="inline-block px-10 py-4 rounded-xl font-semibold text-white bg-[#B7860B] hover:bg-[#a77a0a] transition duration-300 shadow-lg"
          >
            View All Writings
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedWritings;