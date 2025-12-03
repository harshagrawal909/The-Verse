
import React from 'react';
import { Mail, Lock, User } from 'lucide-react';

const CommunityCTA = () => {
  return (
    <section className="py-4" id="community">
      <div 
        className="max-w-4xl mx-auto p-12 rounded-3xl text-center shadow-xl bg-[#FEF8ECFF] border border-[#E3D8B5] "
      >
        <h2 className="text-5xl font-bold bg-gradient-to-r from-[#1E2A28] to-[#4E7C68] bg-clip-text text-transparent mb-6 pb-2">
          Join The Verse Community
        </h2>
        <p className="text-lg text-[#3A3A37] max-w-2xl mx-auto mb-12">
          Become a part of Harsh&apos;s writing journey! Sign up to receive exclusive updates, 
          participate in discussions, and snag early access to his stories. Your insights fuel the narrative.
        </p>

        <form className="max-w-md mx-auto space-y-6 text-left">

          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B7860B]" />
            <input 
              type="text" 
              placeholder="Your Name" 
              aria-label="Your Name"
              className="w-full pl-12 pr-4 py-3 border border-[#E3D8B5] rounded-lg bg-[#FFFDF8] focus:ring-2 focus:ring-[#B7860B] focus:border-[#B7860B] outline-none transition duration-200"
            />
          </div>
          
          {/* Input Field: Email Address */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B7860B]" />
            <input 
              type="email" 
              placeholder="Email address@example.com" 
              aria-label="Email Address"
              className="w-full pl-12 pr-4 py-3 border border-[#E3D8B5] rounded-lg bg-[#FFFDF8] focus:ring-2 focus:ring-[#B7860B] focus:border-[#B7860B] outline-none transition duration-200"
            />
          </div>
          
          {/* Input Field: Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B7860B]" />
            <input 
              type="password" 
              placeholder="Password" 
              aria-label="Password"
              className="w-full pl-12 pr-4 py-3 border border-[#E3D8B5] rounded-lg bg-[#FFFDF8] focus:ring-2 focus:ring-[#B7860B] focus:border-[#B7860B] outline-none transition duration-200"
            />
          </div>

          {/* Sign Up Button (using the gold theme) */}
          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              className="px-10  py-3 rounded-xl font-semibold text-white bg-[#B7860B] hover:bg-[#a77a0a] transition duration-300 shadow-md hover:shadow-lg"
            >
              Sign Up Now
            </button>
          </div>
        </form>
        
      </div>
    </section>
  );
};

export default CommunityCTA;