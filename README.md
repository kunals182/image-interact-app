# PicSync: Real-Time Multi-User Image Interaction Platform

A premium, high-performance web application built for seamless real-time image engagement. This project was developed for the **FotoOwl** technical assessment, focusing on real-time synchronization, architectural clarity, and exceptional UX.


## 🌟 Core Features

- **Infinite Scrolling Gallery**: High-resolution photography fetched dynamically from Unsplash.
- **Real-Time Synchronization**: Instant syncing of comments and emoji reactions using **InstantDB**.
- **Global Activity Feed**: A live bridge between all users, enabling instant navigation to interacting images.
- **Persistent Identities**: Persistent random usernames and unique color profiles stored via Zustand.
- **Premium UI**: Glassmorphic dark-mode design with smooth Framer Motion animations.

## �️ Compliance & Core Constraints

This project was built strictly according to the **FotoOwl Excellence Guidelines**:

- **No Class Components**: 100% Functional React with Hooks.
- **Robust Async UX**: Every network boundary (Unsplash, InstantDB) identifies and handles `loading` and `error` states.
- **Core Logic Visible**: Avoided "black-box" UI kits (like MUI/AntD) that hide implementation details. Used Tailwind v4 for raw CSS control.
- **Original Architecture**: Custom-built state orchestration between the activity feed and image gallery.

## �🔌 API Handling Strategy

The application uses a **Layered Data Strategy**:
1. **Primary Layer**: Unsplash API for high-quality production images.
2. **Fallback Layer**: If the API key is missing or rate-limited, the system automatically switches to a robust mockup service (`picsum.photos`) to ensure zero-downtime during evaluation.
3. **Caching**: TanStack Query (React Query) handles deduplication, caching, and background synchronization of image metadata.

## 💾 InstantDB Schema & Usage

The data layer is built on **InstantDB**, a graph-based, local-first database that provides out-of-the-box real-time subscriptions.

### Schema Entity: `interactions`
```typescript
{
  type: 'like' | 'emoji' | 'comment',
  imageId: string,    // Matches Unsplash Image ID
  payload: string,    // Stores the emoji char or comment text
  username: string,   // Author of the interaction
  userColor: string,  // UI personalization
  timestamp: number   // Global ordering
}
```
**Why InstantDB?** It allows us to treat the database like a local state with `db.useQuery`, handling all WebSocket logic and optimistic updates automatically.

## 🎯 Adherence to Evaluation Criteria

This project was built to demonstrate proficiency across the following assessment pillars:

- **React Fundamentals**: Proper use of `useCallback`, `useMemo`, and `AnimatePresence`. 100% Functional components.
- **Real-Time Mastery**: Implemented InstantDB for multi-user synchronization, including complex global state triggers (Activity Feed -> Modal).
- **UX & Interaction Design**:
    - **Interactive Navigation**: Clicking feed items focuses the relevant image.
    - **Reaction Toggling**: Intelligent interaction management (own reactions are removable/toggable).
    - **Visual Feedback**: Skeleton loaders and smooth Framer Motion transitions for every state change.
- **Code Structure**: Strict separation of concerns between `components`, `services`, `config`, and `store`.
- **Problem Solving**: Implemented a robust "Mock Data Fallback" layer to ensure the app remains functional even without Unsplash API keys.

## 🏗️ Key Technical Decisions

### Global Modal Management
Lifting the `FocusedImageView` to the `App` level in **Zustand** enables a seamless bridge between the Sidebar Feed and the main Gallery. This architectural choice minimizes prop drilling and ensures a single source of truth for the interaction layer.

### Optimized Data Transactions
Transactions are wrapped in `useCallback` and memoized to prevent expensive re-renders in the activity feed, ensuring 60fps performance even during high-frequency real-time updates.

## 🧩 Challenges & Solutions

- **Real-Time Context Switching**: *Challenge:* How to open the correct image modal when a user clicks a "comment" alert in the global feed. *Solution:* Implemented a global `selectedImage` state in Zustand and a dedicated `fetchImageById` service to resolve image metadata on-the-fly.
- **Toggling Reactions**: *Challenge:* Users shouldn't be able to spam multiple same emojis. *Solution:* Implemented a "Toggle" logic that checks for existing authorship of a specific emoji type before transacting.

## 🚀 Future Improvements

1. **Optimistic UI for Deletions**: Improve the "snappiness" of deleting personal comments.
2. **Search & Filter**: Add category-based browsing through Unsplash topic APIs.
3. **Advanced Permissions**: Implement full Auth (Clerk/Lucide) for true user ownership beyond random identities.

---

### 🛠️ Configuration & Setup

1. **Clone the project** and install dependencies:
   ```bash
   npm install
   ```

2. **Setup Environment Variables**:
   Create a `.env` file:
   ```env
   VITE_INSTANT_APP_ID=your_instant_app_id
   VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
   ```

3. **Run Commands**:
   - `npm run dev`: Development server
   - `npm run build`: Production bundle
