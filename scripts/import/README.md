# Vibra Chat

A real-time mobile chat application built with Flutter and Firebase, designed for general users who want a fast, clean, and modern messaging experience.

---

## Features

- **Real-Time Messaging** — Send and receive messages instantly using Firestore live streams
- **Status Updates** — Share moments with your contacts through timed status posts
- **Push Notifications** — Get notified of new messages even when the app is in the background
- **Image Sharing** — Send images in chat powered by ImageKit for fast delivery and optimization
- **Firebase Backend** — Secure authentication, real-time database, and cloud storage via Firebase
- **Clean UI** — Minimal, responsive design that works across Android and iOS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter (Dart) |
| State Management | Riverpod |
| Backend | Firebase (Firestore, Auth, Storage) |
| Image Hosting | ImageKit |
| Local Storage | Hive |
| Notifications | Flutter Local Notifications + FCM |

---

## Getting Started

### Prerequisites
- Flutter SDK 3.0 or higher
- A Firebase project with Android and iOS apps configured
- `google-services.json` placed in `android/app/`
- `GoogleService-Info.plist` placed in `ios/Runner/`

### Installation

```bash
git clone https://github.com/your-username/vibra_chat.git
cd vibra_chat
flutter pub get
flutter run
```

---

## Project Structure

```
lib/
  core/
    services/        # Notification, Hive, ImageKit services
    app_constants.dart
    app_theme.dart
    providers.dart
  features/
    auth/            # Login, registration
    chat/            # Real-time messaging
    profile/         # User profile management
    status/          # Status updates
  shared/            # Shared widgets and utilities
  main.dart
```

---

## Screenshots

> Coming soon

---

## License

This project is for educational purposes.
