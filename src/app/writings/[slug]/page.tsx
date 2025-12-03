"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Playfair_Display } from "next/font/google";
import { useSession } from "next-auth/react";
import { Send, Edit, Trash2, X, Camera } from "lucide-react"; // Added Camera

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface CommentAuthor {
  _id: string;
  name?: string;
  username?: string;
  profileImage?: string; // This is the key field that must be updated by the API
}

interface Comment {
  _id: string;
  userId: CommentAuthor;
  text: string;
  createdAt: string;
  replies?: Comment[];
}

interface StoryRating {
  userId: string;
  rating: number;
}

interface Story {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  coverImage: string;
  createdAt: string;
  author: string;
  rating: number;
  isSeries: boolean;
  seriesName?: string;
  averageRating: number;
  ratingCount: number;
  comments: Comment[];
  ratings?: StoryRating[];
}

type SessionStatus = "authenticated" | "unauthenticated" | "loading";

interface StarProps {
  filled: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const Star = ({ filled, onClick, onMouseEnter, onMouseLeave }: StarProps) => (
  <button
    type="button"
    className="cursor-pointer transition-colors duration-100 text-2xl focus:outline-none focus:ring-1 focus:ring-[#B7860B] rounded-sm"
    style={{ color: filled ? "#B7860B" : "#E3D8B5" }}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    aria-label={filled ? "Rated star" : "Unrated star"}
  >
    {filled ? "★" : "☆"}
  </button>
);

const displayRatingStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={`full-${i}`} className="text-2xl text-[#B7860B]">
        ★
      </span>
    );
  }
  for (let i = fullStars; i < 5; i++) {
    stars.push(
      <span key={`empty-${i}`} className="text-2xl text-[#E3D8B5]">
        ☆
      </span>
    );
  }
  return stars;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

interface CommentComponentProps {
  comment: Comment;
  storyId: string;
  currentUserId: string | undefined;
  sessionStatus: SessionStatus;
  sessionToken?: string;
  onCommentPosted: (newComments: Comment[]) => void;
  isReply?: boolean;
}

const CommentComponent = ({
  comment,
  storyId,
  currentUserId,
  sessionStatus,
  sessionToken,
  onCommentPosted,
  isReply = false,
}: CommentComponentProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isUpdating, setIsUpdating] = useState(false);

  const isOwner = currentUserId && comment.userId._id === currentUserId;

  const config = sessionToken
    ? { headers: { Authorization: `Bearer ${sessionToken}` } }
    : {};

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    setIsUpdating(true);
    try {
      const response = await axios.delete(
        `/api/stories/manage-comment?storyId=${storyId}&commentId=${comment._id}`,
        config
      );
      // API returns new comments array, which will contain the latest user data
      onCommentPosted(response.data.comments); 
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete comment. You may only delete your own comments.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditUpdate = async () => {
    if (!editText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }
    setIsUpdating(true);
    try {
      const response = await axios.put(
        "/api/stories/manage-comment",
        {
          storyId,
          commentId: comment._id,
          newText: editText.trim(),
        },
        config
      );
      // API returns new comments array, which will contain the latest user data
      onCommentPosted(response.data.comments); 
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update comment. You may only edit your own comments.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReplySubmit = async () => {
    if (sessionStatus !== "authenticated") {
      setReplyMessage("Please log in to post a reply.");
      return;
    }
    if (!replyText.trim()) {
      setReplyMessage("Reply cannot be empty.");
      return;
    }

    setIsReplying(true);
    setReplyMessage("Posting reply...");

    const replyConfig = sessionToken
      ? { headers: { Authorization: `Bearer ${sessionToken}` } }
      : {};

    try {
      const response = await axios.post(
        "/api/stories/add-comment",
        { storyId, commentText: replyText.trim(), parentCommentId: comment._id },
        replyConfig
      );
      // API returns new comments array, which will contain the latest user data
      onCommentPosted(response.data.comments); 

      setReplyText("");
      setReplyMessage("Reply posted successfully!");
      if (!isReply) setShowReplyForm(false);
    } catch (error: any) {
      console.error("Reply submission failed:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to post reply. Please try again.";
      setReplyMessage(message);
    } finally {
      setIsReplying(false);
    }
  };

  const containerClass = isReply
    ? "p-3 bg-gray-100 rounded-lg border border-gray-200"
    : "p-4 bg-gray-50 rounded-lg border border-gray-200";

  return (
    <div className={containerClass}>
      <div className="flex items-center space-x-3 mb-2">
        {/* This checks the `profileImage` field populated by the API */}
        <img
          src={comment.userId.profileImage || "/images/user-avatar.png"}
          alt={comment.userId.name || comment.userId.username || "User"}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-[#1E2A28] text-sm">
            {comment.userId.name || comment.userId.username || "Anonymous User"}
            {isOwner && (
              <span className="ml-2 text-xs text-indigo-500 font-normal">
                (You)
              </span>
            )}
          </p>
          <p className="text-xs text-[#3A3A37]">
            {formatDate(comment.createdAt)}
          </p>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-2 ml-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="w-full p-2 border border-[#B7860B] rounded-lg text-[#1E2A28] text-sm"
            disabled={isUpdating}
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(comment.text);
              }}
              className="text-sm px-3 py-1 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-60"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={handleEditUpdate}
              className="text-sm px-3 py-1 bg-[#4E7C68] text-white rounded-md hover:bg-[#1E2A28] disabled:opacity-60"
              disabled={isUpdating || !editText.trim()}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-md text-[#3A3A37] ml-2">{comment.text}</p>
      )}

      {!isEditing && (
        <div className="mt-3 flex space-x-4 ml-2">
          {!isReply && (
            <button
              onClick={() => setShowReplyForm((prev) => !prev)}
              className="text-xs font-medium text-[#4E7C68] hover:text-[#1E2A28] transition disabled:opacity-50"
              disabled={sessionStatus !== "authenticated" || isUpdating}
            >
              {showReplyForm ? "Cancel Reply" : "Reply"}
            </button>
          )}

          {isOwner && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-medium text-blue-500 hover:text-blue-700 transition flex items-center disabled:opacity-50"
                disabled={isUpdating}
              >
                <Edit className="w-3 h-3 mr-1" /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-xs font-medium text-red-500 hover:text-red-700 transition flex items-center disabled:opacity-50"
                disabled={isUpdating}
              >
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </button>
            </>
          )}
        </div>
      )}

      {showReplyForm && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-[#E3D8B5]">
          <textarea
            placeholder={
              sessionStatus === "authenticated"
                ? "Write your reply..."
                : "Log in to post a reply."
            }
            rows={2}
            value={replyText}
            onChange={(e) => {
              setReplyText(e.target.value);
              setReplyMessage("");
            }}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#B7860B] bg-white text-[#1E2A28] text-sm"
            disabled={sessionStatus !== "authenticated" || isReplying}
          />
          <div className="flex justify-between items-center mt-2">
            {replyMessage && (
              <span
                className={`text-xs font-medium ${
                  replyMessage.startsWith("Reply posted")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {replyMessage}
              </span>
            )}
            <button
              onClick={handleReplySubmit}
              className="px-4 py-1 text-sm bg-[#636AE8FF] text-white rounded-lg hover:bg-indigo-700 transition duration-150 flex items-center disabled:opacity-50 ml-auto"
              disabled={
                sessionStatus !== "authenticated" ||
                isReplying ||
                !replyText.trim()
              }
            >
              <Send className="w-3 h-3 mr-1" />
              {isReplying ? "Posting..." : "Post Reply"}
            </button>
          </div>
        </div>
      )}

      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 pl-4 space-y-3 border-l-2 border-gray-200">
          {comment.replies
            .slice()
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((reply) => (
              <CommentComponent
                key={reply._id}
                comment={reply}
                storyId={storyId}
                currentUserId={currentUserId}
                sessionStatus={sessionStatus}
                sessionToken={sessionToken}
                onCommentPosted={onCommentPosted}
                isReply={true}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default function StoryPage({ params }: { params: { slug: string } }) {
  const { slug: storyId } = params;

  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingMessage, setRatingMessage] = useState<string>("");

  const [commentText, setCommentText] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [isCommentPosting, setIsCommentPosting] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    undefined
  );

  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [readingTime, setReadingTime] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const commentSectionRef = useRef<HTMLDivElement | null>(null);

  const nextAuthToken = (session as any)?.token as string | undefined;

  const handleCommentPosted = (newComments: Comment[]) => {
    setStory((prevStory) => {
      if (!prevStory) return null;
      return {
        ...prevStory,
        comments: newComments, // Updates the comments array with the new, fully populated array from the API
      };
    });
  };

  const handleRatingSubmit = async (ratingValue: number) => {
    if (status !== "authenticated") {
      setRatingMessage("Please log in to submit a rating.");
      return;
    }
    if (ratingValue < 1 || ratingValue > 5) return;

    setUserRating(ratingValue);
    setRatingMessage("Submitting your rating...");

    const config = nextAuthToken
      ? { headers: { Authorization: `Bearer ${nextAuthToken}` } }
      : {};

    try {
      const response = await axios.post(
        "/api/stories/rate-story",
        { storyId: story?._id, rating: ratingValue },
        config
      );

      const newAverage = response.data.averageRating;
      const newCount = response.data.ratingCount;

      setStory((prevStory) => {
        if (!prevStory) return null;
        return {
          ...prevStory,
          averageRating: newAverage,
          ratingCount: newCount,
        };
      });
      setRatingMessage(
        `Thank you! Your rating of ${ratingValue} has been saved.`
      );
    } catch (error: any) {
      console.error("Rating submission failed:", error);
      setUserRating(0);
      const message =
        error?.response?.data?.message ||
        "Failed to submit rating. Please try again.";
      setRatingMessage(message);
    }
  };

  const handleCommentSubmit = async () => {
    if (status !== "authenticated") {
      setCommentMessage("Please log in to post a comment.");
      return;
    }

    if (!commentText.trim()) {
      setCommentMessage("Comment cannot be empty.");
      return;
    }

    setIsCommentPosting(true);
    setCommentMessage("Posting comment...");

    const config = nextAuthToken
      ? { headers: { Authorization: `Bearer ${nextAuthToken}` } }
      : {};

    try {
      const response = await axios.post(
        "/api/stories/add-comment",
        { storyId: story?._id, commentText: commentText.trim() },
        config
      );

      // The API's response contains the comments array with the LATEST profileImage URL populated.
      handleCommentPosted(response.data.comments);

      setCommentText("");
      setCommentMessage("Comment posted successfully!");
    } catch (error: any) {
      console.error("Comment submission failed:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to post comment. Please try again.";
      setCommentMessage(message);
    } finally {
      setIsCommentPosting(false);
    }
  };

  const handleCloseAndScrollToComments = () => {
    setIsReaderModalOpen(false);
    setTimeout(() => {
      commentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // Calculate reading time
  useEffect(() => {
    if (story?.content) {
      const words = story.content.trim().split(/\s+/).length;
      const minutes = Math.max(1, Math.round(words / 200)); // ~200 wpm
      setReadingTime(minutes);
    } else {
      setReadingTime(0);
    }
  }, [story?.content]);

  // Scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const total = scrollHeight - clientHeight;
      if (total <= 0) {
        setScrollProgress(0);
        return;
      }
      const scrolled = (scrollTop / total) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch user + story
  useEffect(() => {
    if (!storyId || status === "loading") return;

    const fetchUserAndStory = async () => {
      setIsLoading(true);
      setError(null);

      const config = nextAuthToken
        ? { headers: { Authorization: `Bearer ${nextAuthToken}` } }
        : {};

      let userIdFromApi: string | undefined;

      if (nextAuthToken) {
        try {
          const userResponse = await axios.get("/api/users/me", config);
          userIdFromApi = userResponse.data.user.id;
          setCurrentUserId(userIdFromApi);
        } catch (err) {
          console.error("Failed to fetch user data for ID check:", err);
          setCurrentUserId(undefined);
        }
      } else {
        setCurrentUserId(undefined);
      }

      try {
        // The fetch-single API populates profileImage on comments (src/app/api/stories/fetch-single/route.ts)
        const response = await axios.get(
          `/api/stories/fetch-single?id=${storyId}`,
          config
        );
        const fetchedStory = response.data.story;

        const userRatingData = fetchedStory.ratings?.find(
          (r: StoryRating) => r.userId === userIdFromApi
        );

        setStory({
          ...fetchedStory,
          author: fetchedStory.author || "The Verse Admin",
          description: fetchedStory.description,
          averageRating: fetchedStory.averageRating || 0.0,
          ratingCount: fetchedStory.ratingCount || 0,
          comments: fetchedStory.comments || [],
        } as Story);

        setUserRating(userRatingData?.rating || 0);
        setRatingMessage("");
      } catch (err: any) {
        console.error("Failed to fetch story:", err);
        const message =
          err?.response?.data?.message || "Story not found or unauthorized.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndStory();
  }, [storyId, status, session, nextAuthToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#B7860B] text-2xl font-serif">
        Loading Story...
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-red-800 bg-red-50 font-serif">
        <h2 className="text-3xl font-bold mb-4">Error Loading Story</h2>
        <p className="text-lg">
          {error || "The requested story could not be found."}
        </p>
      </div>
    );
  }

  return (
    <article className="bg-[#f9f6f1ff] min-h-screen">
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-40">
        <div
          className="h-full bg-[#B7860B] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Mode Modal */}
      {story && isReaderModalOpen && (
        <div className="fixed inset-0 z-[60] bg-[#050816]/95 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex justify-center px-4 sm:px-8 py-10">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.65)] px-8 sm:px-12 py-10 sm:py-12">
              <button
                onClick={() => setIsReaderModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition"
                aria-label="Close reader view"
              >
                <X className="w-5 h-5" />
              </button>

              <h1
                className={`${playfair.variable} font-playfair text-3xl sm:text-4xl font-bold text-[#1E2A28] mb-2`}
              >
                {story.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#3A3A37] mb-6">
                By {story.author} • {formatDate(story.createdAt)} •{" "}
                {readingTime > 0 ? `~${readingTime} min read` : ""}
              </p>

              <div className="max-w-[60ch] mx-auto text-lg leading-relaxed text-[#1E2A28] font-serif tracking-wide">
                {story.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-10 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setIsReaderModalOpen(false)}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-100 text-[#1E2A28] rounded-lg hover:bg-gray-200 transition duration-200 text-sm"
                >
                  Close
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <p className="text-xs sm:text-sm text-[#3A3A37]">
                    Enjoyed the story? Share your thoughts ↓
                  </p>
                  <button
                    onClick={handleCloseAndScrollToComments}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-[#B7860B] text-white rounded-lg hover:bg-[#996C08] transition duration-200 text-sm font-semibold"
                  >
                    React & Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <header className="mb-8">
          <h1
            className={`${playfair.variable} font-playfair text-4xl sm:text-5xl font-bold text-[#1E2A28] mb-3`}
          >
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#3A3A37]">
            <span>By {story.author}</span>
            <span className="w-1 h-1 rounded-full bg-[#B7860B]" />
            <span>Published on {formatDate(story.createdAt)}</span>
            {readingTime > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#B7860B]" />
                <span>~{readingTime} min read</span>
              </>
            )}
            {story.category && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#B7860B]" />
                <span className="px-2 py-0.5 rounded-full bg-[#FDF4E2] border border-[#E3D8B5] text-xs">
                  {story.category}
                </span>
              </>
            )}
          </div>

          {story.isSeries && story.seriesName && (
            <p className="mt-3 text-sm sm:text-base text-[#4E7C68] font-semibold">
              Part of the <span className="font-bold">{story.seriesName}</span>{" "}
              series
            </p>
          )}
        </header>

        <div className="relative w-full max-w-[672px] aspect-video mb-8 rounded-xl overflow-hidden shadow-xl mx-auto bg-white">
          <img
            src={story.coverImage}
            alt={`Cover for ${story.title}`}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReaderModalOpen(true)}
              className="px-4 py-2 text-sm sm:text-base font-semibold rounded-lg bg-[#4E7C68] text-white hover:bg-[#1E2A28] transition duration-200 shadow-sm"
            >
              Open Reader Mode
            </button>
            <span className="text-xs sm:text-sm text-[#3A3A37] italic">
              Distraction-free, doc-style reading.
            </span>
          </div>

          <div className="flex items-center text-[#B7860B] text-sm sm:text-base">
            <span className="mr-2 flex">
              {displayRatingStars(story.averageRating)}
            </span>
            <span className="font-semibold mr-2">
              {story.averageRating.toFixed(1)} / 5
            </span>
            <span className="text-xs sm:text-sm text-[#3A3A37]">
              ({story.ratingCount} ratings)
            </span>
          </div>
        </div>

        {/* Story body – continuous scroll */}
        <section className="mb-16">
          <div className="max-w-[70ch] mx-auto text-base sm:text-lg text-[#3A3A37] leading-relaxed font-serif tracking-wide prose">
            {story.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-6 indent-8">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Ratings & Comments */}
        <section
          ref={commentSectionRef}
          className="mt-10 p-6 sm:p-8 border border-[#E3D8B5] bg-[#FEF8EC] rounded-xl shadow-lg"
        >
          <h3 className="text-2xl font-semibold text-[#1E2A28] mb-4">
            Reader Ratings
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-[#B7860B] text-xl mb-4">
            <span className="mr-2 text-2xl flex">
              {displayRatingStars(story.averageRating)}
            </span>
            <span className="text-xl font-bold">
              {story.averageRating.toFixed(1)} out of 5
            </span>
            <span className="text-sm text-[#3A3A37]">
              ({story.ratingCount} ratings)
            </span>
          </div>

          <p className="text-[#3A3A37] mb-3 font-medium">Rate this story:</p>

          <div
            className="flex items-center flex-wrap gap-2 mb-4"
            onMouseLeave={() => setHoverRating(0)}
          >
            {Array.from({ length: 5 }).map((_, index) => {
              const ratingValue = index + 1;
              const isFilled =
                ratingValue <= (hoverRating || userRating || 0);

              return (
                <Star
                  key={index}
                  filled={isFilled}
                  onClick={() => handleRatingSubmit(ratingValue)}
                  onMouseEnter={() => setHoverRating(ratingValue)}
                />
              );
            })}
            {ratingMessage && (
              <span
                className={`ml-2 text-sm font-medium ${
                  ratingMessage.startsWith("Thank you")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {ratingMessage}
              </span>
            )}
          </div>

          {/* Comments */}
          <div className="mt-8">
            <h4 className="text-2xl font-semibold text-[#1E2A28] mb-4 border-t border-[#E3D8B5] pt-6">
              Comments ({story.comments ? story.comments.length : 0})
            </h4>

            <p className="text-[#3A3A37] mb-3">Leave a Comment</p>
            <textarea
              placeholder={
                status === "authenticated"
                  ? "Share your thoughts about the story..."
                  : "Log in to post a comment."
              }
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-4 border border-[#E3D8B5] rounded-lg focus:ring-1 focus:ring-[#B7860B] bg-white text-[#1E2A28]"
              disabled={status !== "authenticated" || isCommentPosting}
            ></textarea>
            <div className="flex justify-between items-center mt-3">
              {commentMessage && (
                <span
                  className={`text-sm font-medium ${
                    commentMessage.startsWith("Comment posted")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {commentMessage}
                </span>
              )}
              <button
                onClick={handleCommentSubmit}
                className="px-6 py-2 bg-[#636AE8FF] text-white rounded-lg hover:bg-indigo-700 transition duration-150 disabled:opacity-50 ml-auto"
                disabled={
                  status !== "authenticated" ||
                  isCommentPosting ||
                  !commentText.trim()
                }
              >
                {isCommentPosting ? "Posting..." : "Post Comment"}
              </button>
            </div>

            <div className="mt-8 space-y-6">
              {story.comments &&
                story.comments
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((comment) => (
                    <CommentComponent
                      key={comment._id}
                      comment={comment}
                      storyId={story._id}
                      currentUserId={currentUserId}
                      sessionStatus={status}
                      sessionToken={nextAuthToken}
                      onCommentPosted={handleCommentPosted}
                      isReply={false}
                    />
                  ))}
              {story.comments && story.comments.length === 0 && (
                <p className="text-center text-[#3A3A37] italic pt-4">
                  No comments yet. Be the first to start the discussion!
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}