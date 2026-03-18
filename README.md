# Project Specification: Interactive Bible Reading App

## Overview

A Next.js web application designed to read and interact with Bible text (specifically the Book of Isaiah). The app features a conversational/story-based UI, speaker-specific color coding, and the ability to save favorites and "spiritual gems."

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (Local Storage for favorites/gems)

## Core Features

1. **Story Viewer UI:** Displays verses similarly to a modern chat or script interface, rather than a traditional wall of text.
2. **Dynamic Theming by Speaker:** Verses change color/style depending on who is speaking (e.g., God, Isaiah, Narrator).
3. **Favorites System:** Users can save specific verses to a favorites list.
4. **Spiritual Gems:** A dedicated section to save and reflect on meaningful quotes or passages.

## Project Structure & File Requirements

### 1. Routing (`/app`)

- `/` (`page.tsx`): Home/Landing page.
- `/book/[bookId]` (`page.tsx`): Displays chapters for a specific book.
- `/book/[bookId]/[chapterId]` (`page.tsx`): The main reading view displaying verses for a specific chapter.
- `/favorites` (`page.tsx`): Displays the user's saved favorite verses.
- `/spiritual-gems` (`page.tsx`): Displays saved highlights/notes.

### 2. Components (`/app/components`)

- `StoryViewer.tsx`: The primary UI component. Takes chapter data and renders the verses, applying themes based on the speaker, and handles the "favorite" button interactions.

### 3. Data & Types

- `/app/types.tsx`: Define interfaces for `Verse`, `Chapter`, `Book`, and `SpeakerTheme`.
- `/app/bookData/bookOfIsaiah.tsx`: Contains the static JSON/Object data structure for the Book of Isaiah (verses, speakers, chapter numbers).

### 4. Libraries & Utilities (`/app/lib`)

- `data.tsx`: Helper functions to fetch/filter book and chapter data.
- `hooks.tsx`: Custom React hooks (e.g., `useLocalStorage`) to manage saved favorites and spiritual gems across the app.
- `speakerThemes.tsx`: Maps speaker names (e.g., "Jehovah", "Isaiah") to specific Tailwind CSS color classes.
