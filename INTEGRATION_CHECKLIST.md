# NursaFlow Integration Checklist

This document details the exact files and integration points for connecting real production backends to **NursaFlow**.

## Integration Status Matrix

| Backend Service | Status | Integration Target Files | Key Setup Tasks |
| :--- | :--- | :--- | :--- |
| **Firebase Authentication** | Placeholder Ready | `src/services/firebase/authService.ts` | Replace mock sign-in with `signInWithEmailAndPassword`, `createUserWithEmailAndPassword` |
| **Cloud Firestore** | Placeholder Ready | `src/services/firebase/firestoreService.ts` | Replace local storage handlers with `collection()`, `onSnapshot()`, `setDoc()`, `addDoc()` |
| **Firebase Storage** | Placeholder Ready | `src/services/firebase/storageService.ts` | Replace object URLs with `uploadBytesResumable()` for avatars and note attachments |
| **Firebase Cloud Messaging** | Placeholder Ready | `src/services/firebase/notificationService.ts` | Register `firebase-messaging-sw.js` and call `getToken()` |
| **Gemini AI Tutor** | Placeholder Ready | `src/services/gemini/geminiService.ts` | Connect `@google/genai` or cloud endpoint to `askNursingTutor()` |
| **ZEGOCLOUD Audio/Video** | Placeholder Ready | `src/services/zegocloud/callService.ts` | Initialize ZEGOCLOUD Call Kit token & WebRTC signaling |
| **ZEGOCLOUD Study Rooms** | Placeholder Ready | `src/services/zegocloud/roomService.ts` | Mount `ZegoUIKitPrebuilt` in DOM container node |

---

## 1. Firebase Integration Guide

### Files to Modify:
- `src/services/firebase/authService.ts`
- `src/services/firebase/firestoreService.ts`
- `src/services/firebase/storageService.ts`
- `src/services/firebase/notificationService.ts`

### Action Steps:
1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Install the Firebase SDK:
   ```bash
   npm install firebase
   ```
3. Initialize Firebase app instance with your `firebaseConfig` keys.
4. Replace `TODO` placeholder implementations in `src/services/firebase/*`.

---

## 2. Gemini AI Integration Guide

### Files to Modify:
- `src/services/gemini/geminiService.ts`

### Action Steps:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Install GenAI SDK:
   ```bash
   npm install @google/genai
   ```
3. Replace `askNursingTutor()` in `geminiService.ts` to query `gemini-2.5-flash` or `gemini-2.5-pro`.
4. **Security Note**: Never hardcode `GEMINI_API_KEY` in client-side React code. Use Firebase Cloud Functions or backend API proxy.

---

## 3. ZEGOCLOUD Real-Time Video & Audio Integration Guide

### Files to Modify:
- `src/services/zegocloud/roomService.ts`
- `src/services/zegocloud/callService.ts`

### Action Steps:
1. Register on [ZEGOCLOUD Admin Console](https://console.zegocloud.com/) and retrieve `appID` and `serverSecret`.
2. Install ZEGOCLOUD Web UIKit SDK:
   ```bash
   npm install @zegocloud/zego-uikit-prebuilt
   ```
3. Update `joinStudyRoom()` in `roomService.ts` to generate `kitToken` and render WebRTC video streams in the live room modal.

---

## Development & Build Commands

```bash
# Run local development server
npm run dev

# Run TypeScript compiler check
npm run lint

# Build production bundle
npm run build
```
