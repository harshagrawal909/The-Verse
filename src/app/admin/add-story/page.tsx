"use client";

import { useState } from 'react';
import { CloudUpload,X } from 'lucide-react';

interface NewStory {
  title: string;
  category: string;
  summary: string;
  fullText: string;
  tags: string;
  coverImage: File | null;
  status: 'Draft' | 'Published';
  isFeatured: boolean;
  isSeries: boolean;
  seriesName: string;
}

const useAddStoryForm = () => {
  const [storyData, setStoryData] = useState<NewStory>({
    title: '',
    category: 'Fantasy',
    summary: '',
    fullText: '',
    tags: '',
    coverImage: null,
    status: 'Draft',
    isFeatured: false,
    isSeries: false,
    seriesName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setStoryData(prev => ({
            ...prev,
            [name]: (e.target as HTMLInputElement).checked
        }));
    } else {
        setStoryData(prev => ({
            ...prev,
            [name]: value
        }));
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStatus = (status: 'Draft' | 'Published') => {
      setStoryData(prev => ({ ...prev, status }));
  };

  const handleFileChange = (file: File | null) => {
    setStoryData(prev => ({ ...prev, coverImage: file }));
  };

  const handleSubmit = async (targetStatus: 'Draft' | 'Published') => {
    setError(null);
    setIsLoading(true);

    if (!storyData.title || !storyData.summary || !storyData.fullText) {
        setError("Title, Summary (Description), and Full Story Content are required.");
        setIsLoading(false);
        return;
    }

    if (storyData.isSeries && !storyData.seriesName.trim()) {
        setError("Series Name is required if 'Is a Book Series' is checked.");
        setIsLoading(false);
        return;
    }

    try {
      
        console.log("Cover Image File Status:", storyData.coverImage);
        const coverImageUrl = await uploadImage(storyData.coverImage);

        const payload = {
            title: storyData.title,
            description: storyData.summary, 
            content: storyData.fullText, 
            coverImage: coverImageUrl,
            tags: storyData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0),
            isPublished: storyData.status === 'Published',
            category: storyData.category,
            isSeries: storyData.isSeries,
            seriesName: storyData.isSeries ? storyData.seriesName.trim() : undefined
        };

        console.log("Submitting API Payload:", payload);
        const response = await fetch('/api/stories/add-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorMessage = `Failed to save story (Status: ${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
            }
            throw new Error(errorMessage);
        }
        window.location.href= " /stories"
        alert(`Story "${storyData.title}" successfully saved as ${targetStatus}!`); 

    } catch (err) {
        console.error("Submission Error:", err);
        setError((err as Error).message || "An unexpected network error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  const setTags = (newTagsString: string) => {
    setStoryData(prev => ({ ...prev, tags: newTagsString }));
  };

  const uploadImage = async (file: File | null): Promise<string> => {
        if (!file) {
            return "https://placehold.co/600x400/E3D8B5/1E2A28?text=Default_Cover"; 
        }

        const formData = new FormData();
        formData.append('coverFile', file); 

        try {
            const response = await fetch('/api/upload-image', { 
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = `Failed to upload image (Status: ${response.status})`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data.url; 

        } catch (error) {
            console.error("Upload failed:", error);
            throw new Error(`Image upload failed: ${(error as Error).message}`);
        }
    };

  return {
    storyData,
    handleChange,
    setStatus,
    handleFileChange,
    handleSubmit,
    setTags,
    isLoading,
    error
  };
};

const FormInput = ({ label, name, type = 'text', placeholder, value, onChange }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-lg font-medium text-[#1E2A28] mb-2">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border-1 border-[#E3D8B5] rounded-lg text-[#1E2A28] focus:ring-1  transition duration-200 shadow-sm" required
    />
  </div>
);

const FormTextarea = ({ label, name, placeholder, value, onChange, rows = 4 }) => (
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
      className="w-full px-4 py-3 border-1 border-[#E3D8B5] rounded-lg text-[#1E2A28]  focus:ring-1  transition duration-200 shadiw-md"
      required
    ></textarea>
  </div>
);

function AddStoryComponent() {
  const { storyData, handleChange, setStatus, handleFileChange, handleSubmit, setTags, isLoading, error } = useAddStoryForm();
  const [isDragging, setIsDragging] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const getTagsArray = () => 
    storyData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

  const addTag = (input: string) => {
    const newTag = input.trim().toLowerCase();
    if (!newTag) return;
    const currentTags = getTagsArray();
    if (!currentTags.includes(newTag)) {
      const updatedTags = [...currentTags, newTag];
      setTags(updatedTags.join(', '));
    }
    setTagInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = getTagsArray();
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags.join(', '));
  };

  const handleTagInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInputValue.replace(',', '').trim());
    }
    if (e.key === 'Backspace' && tagInputValue === '') {
        const tags = getTagsArray();
        if (tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    }
  };

  const handleTagInputBlur = () => {
    if (tagInputValue.trim()) {
        addTag(tagInputValue);
    }
  };

  const displayedTags = getTagsArray();

  return (
    <div className="min-h-screen  text-[#1E2A28] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">

        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1E2A28] to-[#4E7C68] bg-clip-text text-transparent mb-10 pb-2">
          Add New Story
        </h1>

        {isLoading && (
            <div className="flex items-center justify-center p-4 mb-6  text-[#B7860B] rounded-lg border border-[#B7860B] shadow-inner">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#B7860B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving story...
            </div>
        )}
        {error && (
            <div className="p-4 mb-6 bg-red-100 text-red-800 rounded-lg border border-red-300 shadow-sm">
                <p className="font-semibold">Submission Error:</p>
                <p className="text-sm">{error}</p>
            </div>
        )}
        
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8 ">

            <div className="bg-[#FEF8ECFF] p-6 sm:p-8 rounded-xl shadow-lg border border-[#E3D8B5]">
                <h2 className="text-2xl font-semibold text-[#1E2A28] pb-2">Story Details</h2>
                <p className='text-[#1E2A28] mb-6 border-b border-[#E3D8B5] pb-2'>Update the details and content of your story.</p>
                

                <div className="mb-6">
                    <label className="inline-flex items-center text-[#3A3A37] mt-4">
                        <input
                            type="checkbox"
                            name="isSeries"
                            checked={storyData.isSeries}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 text-[#B7860B] border-[#E3D8B5] rounded focus:ring-[#B7860B]"
                        />
                        <span className="ml-3 font-medium text-lg text-[#1E2A28]">Is this a Book Series?</span>
                    </label>
                </div>


                {storyData.isSeries && (
                    <FormInput 
                        label="Book Series Name"
                        name="seriesName"
                        placeholder="Enter the name of the book series (e.g., The Chronicle of Aethel)"
                        value={storyData.seriesName}
                        onChange={handleChange}
                    />
                )}


                <FormInput 
                    label="Story Title"
                    name="title"
                    placeholder="Enter story title"
                    value={storyData.title}
                    onChange={handleChange}
                />

                <div className="mb-6">
                    <label htmlFor="category" className="block text-lg font-medium text-[#1E2A28] mb-2">
                    Category
                    </label>
                    <select
                    id="category"
                    name="category"
                    value={storyData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#E3D8B5] rounded-lg shadow-lg text-[#1E2A28] focus:ring-1 transition duration-200 appearance-none"
                    >
                        <option value="Fantasy">Fantasy</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Thriller">Thriller</option>
                        <option value="Romance">Romance</option>
                    </select>
                </div>

                <FormTextarea
                    label="Summary"
                    name="summary"
                    placeholder="Provide a brief summary of the story (max 300 words)"
                    value={storyData.summary}
                    onChange={handleChange}
                    rows={3}
                />
                <div className='border-b border-[#E3D8B5] my-10 '></div>

                <FormTextarea
                    label="Full Story Content"
                    name="fullText"
                    placeholder="Write your full story here..."
                    value={storyData.fullText}
                    onChange={handleChange}
                    rows={15}
                />
                <div className='border-b border-[#E3D8B5] my-10 '></div>

                <label className="block text-lg font-medium text-[#1E2A28] mb-2">Cover Image</label>
                <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('coverImageInput')?.click()}
                className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition duration-300 
                    ${isDragging ? 'border-[#B7860B] bg-[#FEF8EC]' : 'border-[#E3D8B5] bg-white hover:bg-[#FEF8EC]'}`
                }
                >
                    <input
                        type="file"
                        id="coverImageInput"
                        name="coverImage"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        required
                    />
                    {storyData.coverImage ? (
                        <p className="text-[#4E7C68] font-medium text-center">
                        **File selected:** {storyData.coverImage.name}
                        <span className="block text-sm text-[#3A3A37] mt-1">Click to change or drag and drop a new one.</span>
                        </p>
                    ) : (
                        <>
                        <CloudUpload className="w-10 h-10 text-[#B7860B] mb-3" />
                        <p className="text-[#3A3A37]">Drag & drop image here or **click to upload**</p>
                        </>
                    )}
                </div>
                <div className='border-b border-[#E3D8B5] my-10 '></div>

                <div className="mb-6">
                    <label htmlFor="tag-input" className="block text-lg font-medium text-[#1E2A28] mb-2">
                        Tags
                    </label>
                    <input
                        type="text"
                        id="tag-input"
                        name="tag-input"
                        placeholder="Add tags (e.g., fantasy, adventure, magic). Press Enter or Comma to add."
                        value={tagInputValue}
                        onChange={(e) => setTagInputValue(e.target.value)}
                        onKeyDown={handleTagInputKey}
                        onBlur={handleTagInputBlur}
                        className="w-full px-4 py-3 border border-[#E3D8B5] rounded-lg text-[#1E2A28] focus:ring-1 focus:ring-[#B7860B] transition duration-200 shadow-sm mb-3"
                    />

                    <div className="flex flex-wrap gap-2 min-h-[30px] pt-1">
                        {displayedTags.map((tag) => (
                            <span 
                                key={tag} 
                                className="flex items-center bg-[#E3D8B5] text-[#1E2A28] text-sm font-medium py-1 px-3 rounded-full shadow-sm"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-2 text-[#3A3A37] hover:text-[#B7860B] transition"
                                    aria-label={`Remove tag ${tag}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                        {displayedTags.length === 0 && (
                            <p className="text-sm text-[#3A3A37]/60 italic">No tags added yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-[#FEF8ECFF] p-6 sm:p-8 rounded-xl shadow-lg border border-[#E3D8B5]">
                <h2 className="text-2xl font-semibold text-[#1E2A28] mb-6 border-b border-[#E3D8B5] pb-2">Publishing Options</h2>
                <div className="mb-6">
                    <label className="block text-lg font-medium text-[#1E2A28] mb-3">Status</label>
                    <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center text-[#3A3A37]">
                        <input
                        type="radio"
                        name="status"
                        value="Draft"
                        checked={storyData.status === 'Draft'}
                        onChange={() => setStatus('Draft')}
                        className="form-radio h-5 w-5 text-[#B7860B] border-[#E3D8B5] focus:ring-[#B7860B]"
                        />
                        <span className="ml-3">Draft</span>
                    </label>
                    <label className="inline-flex items-center text-[#3A3A37]">
                        <input
                        type="radio"
                        name="status"
                        value="Published"
                        checked={storyData.status === 'Published'}
                        onChange={() => setStatus('Published')}
                        className="form-radio h-5 w-5 text-[#B7860B] border-[#E3D8B5] focus:ring-[#B7860B]"
                        />
                        <span className="ml-3">Published</span>
                    </label>
                    </div>
                </div>

                <label className="inline-flex items-center text-[#3A3A37] mt-4">
                    <input
                    type="checkbox"
                    name="isFeatured"
                    checked={storyData.isFeatured}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-[#B7860B] border-[#E3D8B5] rounded focus:ring-[#B7860B]"
                    />
                    <span className="ml-3 font-medium">Mark as featured story</span>
                </label>
            </div>

            <div className="flex justify-end gap-4 pt-4 pb-12">
                <button
                    type="button"
                    onClick={() => handleSubmit('Draft')}
                    className="px-6 py-3 text-lg font-semibold rounded-lg border border-[#B7860B] text-[#B7860B] hover:bg-[#E3D8B5] transition duration-300"
                >
                    Save as Draft
                </button>
                <button
                    type="button"
                    onClick={() => handleSubmit('Published')}
                    className="px-6 py-3 text-lg font-semibold rounded-lg bg-[#B7860B] text-white hover:bg-[#996C08] transition duration-300 shadow-md"
                    disabled={isLoading}
                >
                    Publish Story
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default function AddStoryPage() {
    return <AddStoryComponent />;
}
