import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import axios from "axios" 
import jwt from "jsonwebtoken";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const { email, name, image } = user;
      const provider = account?.provider || "credentials";

      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const socialLoginUrl = `${baseUrl}/api/users/social-login`

      try {
        console.log("Custom backend social login/signup initiated for:", email, provider);
        console.log(`[NextAuth] Calling custom API at: ${socialLoginUrl}`)
        const response = await axios.post(socialLoginUrl, {
          email,
          name,
          profileImage: image,
          provider: provider,
        });
        console.log(`[NextAuth] Backend API status: ${response.status}`);
        if (response.status === 200 || response.status === 201) {
          user.customToken = response.data.token;
          return true;
        }

      } catch (error) {
         if (axios.isAxiosError(error) && error.response) {
            console.error(
                `[NextAuth ERROR] Social login API failed: Status ${error.response.status}`, 
                'Response data:', error.response.data
            );
        } else {
             console.error("[NextAuth ERROR] Network or unknown error during social login:", error);
        }
        return `/login?error=SocialLoginFailed`;  
      }
      
      return false;
    },
  
  async jwt({ token, user, account, profile }) {
      if (user?.customToken) {
        token.token = user.customToken; 
      }
      return token;
  },
  async session({ session, token, user }) {
      if (token.token) {
        session.token = token.token;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
