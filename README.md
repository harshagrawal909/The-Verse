# 🌌 The Verse

The Verse is a full-stack digital storytelling and creative portfolio platform built with Next.js, MongoDB, and NextAuth/route.ts, uploaded:src/dbConfig/dbConfig.ts]. It is designed to showcase creative writings, foster a community, and provide administrators with a robust Content Management System (CMS).

## 💡 Key Features

The application is split into two primary experiences: a secure Admin dashboard and a highly interactive public reader platform.

### Reader & Community Features

* **Story Catalog:** A comprehensive public page (`/stories`) allows users to view, filter, and sort all published works based on genre, series status, and popularity.
* **Interactive Ratings:** Users can rate any story from 1 to 5 stars, with the system calculating and displaying the average rating across all submissions/page.tsx].
* **Nested Comments:** Readers can post top-level comments and nested replies on stories. Users have full CRUD (Create, Read, Update, Delete) functionality for their own contributions/page.tsx].
* **Testimonial Submission:** Authenticated users can submit a testimonial or opinion about the author's work for admin review. Published testimonials are displayed on the About page.
* **Secure User Authentication:** Supports both manual email/password login and one-click social login via Google and Facebook, managed through **NextAuth.js**/route.ts, uploaded:src/app/signup/page.tsx].
* **Profile Management:** Authenticated users can manage their display name, username, and profile picture in their dedicated profile area.

### Admin & CMS Features

* **Authentication & Security:** Admin routes are strictly protected by middleware, ensuring only authenticated users with the `isAdmin: true` flag can access them.
* **Story Management:** Full CRUD operations for stories (Create, Update, Delete) are available through dedicated admin pages/page.tsx, uploaded:src/app/api/stories/delete-story/route.ts, uploaded:src/app/api/stories/update-story/route.ts].
* **Global Configuration:** Administrators can update critical site-wide content, such as the Home page Hero section, the About page bio, and the author image, via a dedicated configuration API.
* **Testimonial Review:** Admins can view all submitted testimonials and manually approve (publish), unpublish, or delete them.

## 💻 Tech Stack

| Component | Technology | Role | Source Example |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js 14** (App Router) | High-performance React framework for server-side rendering (SSR) and Server Components. | `src/app/layout.tsx` |
| **Language** | **TypeScript** | For type safety and better development experience. | `src/utils/authMiddleware.ts` |
| **Styling** | **Tailwind CSS** | Utility-first framework for rapid, responsive design. | `src/app/globals.css` |
| **Database** | **MongoDB & Mongoose** | NoSQL database and ORM for storing application data. | `src/models/userModel.js` |
| **Authentication**| **NextAuth.js** | Handles sessions and OAuth (Google, Facebook) integrations/route.ts]. | `src/app/api/users/login/route.ts` |
| **File Storage** | **Vercel Blob** | Used for storing cover images and user profile pictures via a dedicated API endpoint. | `src/app/api/upload-image/route.ts` |

## ⚙️ Getting Started

Follow these steps to get your development environment up and running.

### Prerequisites

* Node.js (v18+)
* npm or yarn
* A MongoDB Atlas cluster (or local instance)
* A Vercel account (optional for local development, required for deployment to Vercel and Vercel Blob storage)

### 1. Installation

```bash
# Clone the repository
git clone <your-repository-url> the-verse

# Navigate to the project directory
cd the-verse

# Install dependencies
npm install
# or yarn install
