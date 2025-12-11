import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';

interface ConfigData {
    heroTitle: string;
    heroSubtitle: string;
}

const HeroSection = () => {
    const [config, setConfig] = useState<ConfigData>({ heroTitle: 'Welcome to The Verse', heroSubtitle: 'Loading captivating narratives...' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axios.get('/api/admin/config');
                setConfig(response.data.config);
            } catch (error) {
                console.error("Failed to fetch config:", error);
                // Keep default/fallback values on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    // Use a fallback for the image if config data hasn't loaded yet
    const imageSource = "https://s6icfhctlhbebsyk.public.blob.vercel-storage.com/homeImage.png";

    return (
        <section className="flex flex-col lg:flex-row justify-center items-center max-w-[1024px] mx-auto px-4 sm:px-8 lg:px-12 lg:space-x-16 bg-[#FEF8ECFF] min-h-[553px] rounded-xl z-10 shadow-[0px_0px_1px_#171a1f12,_0px_0px_2px_#171a1f1F] pt-10 pb-12">
              <div className="lg:flex-1 max-w-lg lg:pl-10 text-center lg:text-left mb-8 lg:mb-0">
                <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-bold leading-tight bg-gradient-to-r from-[#1E2A28] to-[#4E7C68] text-transparent bg-clip-text mb-4 tracking-tight">
                    {config.heroTitle}
                </h1>
                <p className="text-[18px] text-[#3A3A37] leading-relaxed mb-8">
                  {config.heroSubtitle}
                </p>
                <div className="flex space-x-4 justify-center lg:justify-start">
                  <a 
                    href="/stories" 
                    className="px-6 py-3 rounded-xl font-semibold text-white bg-[#B7860BFF] shadow-md"
                  >
                    Explore My Stories
                  </a>
                  <a 
                    href="/signup" 
                    className="px-6 py-3 rounded-xl font-semibold text-white bg-[#B7860BFF]"
                  >
                    Join Now
                  </a>
                </div>
              </div>
              <div className="lg:flex-1 flex justify-center lg:pr-10">
                <div className="relative w-full max-w-[416px] h-[300px] sm:h-[384px] shadow-2xl rounded-2xl border-0 border-white">
                    <img 
                        src={imageSource} 
                        alt="Evelyn Thorne smiling while writing at a table"
                        className="rounded-2xl w-full h-full object-contain hover:scale-105 transition-transform duration-500" 
                    />
                </div>
              </div>
        </section>
    )
}

export default HeroSection;