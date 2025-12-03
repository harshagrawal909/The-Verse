import Link from "next/link";
import { Linkedin, Mail, Instagram, Github} from "lucide-react"

export default function Footer(){
    const icon_size=16
    return (
        <footer className="w-full left-0 bottom-0  text-white h-[52px] flex items-center bg-[#F9F6F1FF] shadow-[0px_0px_1px_#171a1f12,_0px_0px_2px_#171a1f1F] rounded-none px-16 lg:px-32 sm:px-4">
            <div className="text-black flex items-center space-x-2 font-medium text-sm ">
                <Link href="" className="flex items-center justify-center cursor-pointer hover:text-gray-600">Explore</Link>
                <span className="text-gray-400">·</span>
                <Link href="" className="flex items-center justify-center cursor-pointer hover:text-gray-600">Connect</Link>
            </div>
            <div className="flex items-center space-x-5 ml-auto text-gray-700">
                <Link href="https://www.linkedin.com/in/harshagrawal42" target="_blank" aria-label="LinkedIn" className="hover:text-black">
                    <Linkedin size={icon_size} /> 
                </Link>
                <Link href="mailto:harshagrawal5843@gmail.com" target="_blank" aria-label="Mail" className="hover:text-black">
                    <Mail size={icon_size} /> 
                </Link>
                <Link href="https://www.instagram.com/storywritter___/" target="_blank" aria-label="Instagram" className="hover:text-black">
                    <Instagram size={icon_size} /> 
                </Link>
                <Link href="https://github.com/harshagrawal909" target="_blank" aria-label="GitHub" className="hover:text-black">
                    <Github size={icon_size} /> 
                </Link>
            </div>
        </footer>
    )
}