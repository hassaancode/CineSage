# CineSage - AI Movie Recommendation System

AI movie recommendation system built in Next.js using the Gemini API and TMDB API.

> [!NOTE]
> **Live Preview:** 🔗 [cinesage-app.vercel.app](https://cinesage-app.vercel.app/)

## ✨ Features

1.  Google Authentication
2.  Recommendations based on Scenario.
3.  Recommendations based on Movies.
4.  Bookmark Movies/TV
5.  Genre Filters.
6.  Type Filter (Movie / TV).
7.  Sorting Based on (Release date / Popular / IMDB rating).
8.  Movie dialog card with metadata
    *   Movie Trailer embedded in movie dialog
    *   Cast Tab in movie dialog
    *   Reviews Tab in movie dialog

## 🚀Api's Used
- Gemini api  
- TMDB api

## 🛠️ Prerequisites

Before running this project, ensure you have the following installed on your machine:

*   Node.js (https://nodejs.org)
*   Git (https://git-scm.com/install/windows)

## ⚙️ Getting Started

Follow these steps to set up and run the project locally:

1.  **Clone the repository:**

    ```bash
    git clone [repository URL]
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd cine-sage
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Configure Environment Variables:**
    Create a `.env.local` file in the root of the project and add your API keys:

    ```
    # Example:
    # NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    # NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
    ```
    *(Replace with actual variable names and obtain your API keys from Gemini and TMDB.)*

5.  **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

    Open [http://localhost:xxxx](http://localhost:3000) with your browser to see the result.

## 💻 Development Notes

*   You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.
*   This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
