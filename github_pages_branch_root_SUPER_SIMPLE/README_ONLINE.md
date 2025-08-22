# Online Setup (GitHub Pages + Firebase)

This build supports **online sync** via Firebase (Auth + Firestore + Storage) and works on **GitHub Pages**.

## 1) Create Firebase project (free tier is fine)
- Enable **Authentication → Sign-in method → Anonymous**.
- Enable **Firestore Database** (in production or test mode).
- Enable **Storage**.

## 2) Add your Web app / config
- In Firebase console → Project settings → General → "Your apps" → Web → copy the config.
- Paste it into `static/firebase.config.js`:

```js
window.FIREBASE_CONFIG = {
  apiKey: "…",
  authDomain: "…",
  projectId: "…",
  storageBucket: "…",
  messagingSenderId: "…",
  appId: "…"
};
```

## 3) Create a chat document for testing (optional)
- Collection: `chats`
- Document ID: any (e.g., "general")
- Fields:
  - `name`: "General"
  - `members`: [ "<YOUR_ANON_UID>" ] (Use the UID from your browser console after it signs in)
  - `updatedAt`: server timestamp or any date
  - `lastMessage`: ""

The app will subscribe to chats where `members` contains the current user's UID.

## 4) Deploy to GitHub Pages
- Use the GitHub workflow we set up earlier, or Netlify/Cloudflare Pages.
- If `FIREBASE_CONFIG` is empty, the app stays **offline** and shows a banner.
- Once filled, it will sign in anonymously and sync chats & messages.

## 5) About uploads
- Files are uploaded to Storage: `uploads/{uid}/{timestamp_filename}`.
- Messages store the public URL; audio/video/images download & play from the cloud.
