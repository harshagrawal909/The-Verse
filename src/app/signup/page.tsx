"use client";
import Image from "next/image";
import Link from "next/link";
import {Eye,EyeOff} from "lucide-react"
import {useState} from "react";
import axios from "axios"
import {useRouter} from "next/navigation"
import { signIn } from "next-auth/react";
import GoogleIcon from "../components/icons/GoogleIcon";
import FacebookIcon from "../components/icons/FacebookIcon";

export default function signup(){
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false);
    const [user,setUser]= useState({
        username:"",
        email:"",
        password:""
    })

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/users/signup",user)
            console.log("Signup success",response.data)
            setUser({username:"",email:"",password:""})
            router.push("/login")
        } catch (error) {
            console.log("Signup error",error)
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 400) {
                const errorMessage = error.response.data.message || "Invalid input data.";
                window.alert(errorMessage); 
                } else {
                window.alert("An unexpected error occurred during signup.");
                }
            } else {
            window.alert("A network connection error occurred.");
            }
        } 
    }

    const handleSocialLogin = (provider) => {
        signIn(provider, { callbackUrl: "/" })
        .then(response => {
                if (response?.url) {
                    window.location.href = response.url;
                } else if (response?.error) {
                    // Handle case where NextAuth returns an error immediately
                    console.error("Sign-in error:", response.error);
                    router.push(`/login?error=${response.error}`);
                }
            })
            .catch(error => {
                console.error("Redirection failure:", error);
            }); 
    };

    return (
        <div className="bg-[#FEF8ECFF] w-[385px] mx-auto 
                shadow-[0px_0px_1px_#171a1f12,_0px_0px_2px_#171a1f1F] 
                rounded-xl flex flex-col items-center 
                pt-10 pb-8 my-10">
            <Link href="/" className="">
                <Image src="/logo/newLogo.png" alt="Logo" width={120} height={40} />
            </Link>
            <div className="flex flex-col items-center w-full px-8">
                <h2 className="text-xl font-bold text-[#171A1FFF] mb-1">Create Your Account</h2>
                <p className="text-sm text-[#565D6DFF] mb-8">
                    Join the community and start your writing journey.
                </p>
                
                <form className="w-full space-y-4 px-4" onSubmit={handleSignup}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-[#171A1FFF] mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="username"
                                    placeholder="Enter your desired username"
                                    className="w-full pl-4 pr-4 py-2 border-1 border-[#DEE1E6FF] rounded-md shadow-sm text-sm"
                                    value={user.username}
                                    onChange={(e) => setUser({...user, username: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-[#171A1FFF] mb-2">
                                email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    className="w-full pl-4 pr-4 py-2 border-1 border-[#DEE1E6FF] rounded-md shadow-sm text-sm"
                                    value={user.email}
                                    onChange={(e) => setUser({...user, email: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#171A1FFF] mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Minimum 8 characters"
                                    className="w-full pl-4 pr-10 py-2 border-1 border-[#DEE1E6FF] rounded-md shadow-sm text-sm"
                                    minLength={8}
                                    value={user.password}
                                    onChange={(e) => setUser({...user, password: e.target.value})}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {/* Display Eye or EyeOff based on state */}
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 bg-[#636AE8FF] text-white font-medium rounded-md shadow-md hover:bg-indigo-700 transition duration-150"
                        >
                            Sign Up
                        </button>
                </form>

                <div className="flex items-center w-full my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-sm text-gray-500">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="w-full space-y-3 px-4">
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="w-full flex items-center justify-center py-2 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 transition duration-150 cursor-pointer"
                    >
                        <div className="w-5 h-5 mr-3">
                            <GoogleIcon />
                        </div>
                        Continue with Google
                    </button>
                    <button
                        onClick={() => handleSocialLogin('facebook')}
                        className="w-full flex items-center justify-center py-2 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 transition duration-150 cursor-pointer"
                    >
                        <div 
                            className="w-5 h-5 mr-3 flex items-center justify-center rounded-sm"
                            style={{ backgroundColor: '#1877F2' }} 
                        >
                            <FacebookIcon size={16} /> {/* Reduced icon size slightly to fit inside the blue square */}
                        </div>
                        Continue with Facebook
                    </button>
                </div>

                <div className="mt-8 text-sm">
                    Already have an account? 
                    <Link href="/login" className="text-[#636AE8FF] font-medium hover:underline ml-1">
                        Login
                    </Link>
                </div>


            </div>
        </div>
    )
}