# Zorvyn Finance

**Zorvyn** is a premium, state-of-the-art personal finance companion built with React Native and Expo. It provides a seamless and visually stunning experience for tracking expenses, managing savings goals, and gaining deep insights into your financial habits.

![Aesthetics](https://img.shields.io/badge/Aesthetics-Premium-blueviolet)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![Tech](https://img.shields.io/badge/Tech-React%20Native%20%7C%20Expo-green)

---

## 📖 Project Overview

Zorvyn was designed for the privacy-conscious user who demands a high-end, mobile-first financial management experience. Unlike typical finance apps that are cluttered with ads and complex banking integrations, Zorvyn focuses on the **essential relationship between a user and their daily habits**.

The project aims to provide:
1.  **Immediate Clarity**: Know exactly how much you have and what you've spent within seconds of opening the app.
2.  **Strategic Savings**: Move beyond simple tracking to active goal management with an intelligent "Daily Spend" strategy.
3.  **Visual Excellence**: A UI that feels like a premium banking app, featuring smooth animations, glassmorphism, and a robust theme engine.

---

## ✨ Feature Deep Dive

### 🏠 Intelligent Dashboard
- **Dynamic Balance Hero**: A high-impact visualization of your current financial standing.
- **Weekly Spend Chart**: Powered by Shopify Skia, providing smooth, hardware-accelerated bar charts to track 7-day trends.
- **Contextual Greetings**: Personalized dashboard that changes based on the time of day and your setup status.

### 💰 Transaction Engine
- **Full CRUD Support**: Create, Read, Update, and Delete transaction records with localized currency formatting.
- **Localized Categorization**: 10+ preset categories with custom-curated icons and color tokens.
- **Keyboard-Optimized UI**: Specialized layouts that ensure input fields and headers remain visible during typing.

### 🎯 Goal Strategy System
- **Daily Spend Calculation**: Automatically calculates how much you can afford to spend each day to reach your savings goal by the end of the month.
- **Streak Gamification**: Tracks daily usage to encourage consistent financial logging.
- **Archive System**: View history of previous goals to track long-term progress.

### 👤 Personalization & Branding
- **Custom Theme Engine**: Seamless switching between Light and Dark modes with automatic system detection.
- **Branding-First Onboarding**: A clean, immersive onboarding experience focused on privacy and user identity.

---

## 🛠 Tech Stack

- **Core Framework**: [React Native](https://reactnative.dev/) & [Expo SDK 54](https://expo.dev/) (Native 0.81.5)
- **Data Visualization**: [Victory Native](https://formidable.com/open-source/victory-native/) with [Shopify Skia](https://shopify.github.io/react-native-skia/)
- **Animation Layer**: [React Native Reanimated 4.x](https://docs.swmansion.com/react-native-reanimated/)
- **State Architecture**: [Zustand](https://github.com/pmndrs/zustand) with MMKV-based Persistence
- **Navigation**: [Expo Router v3](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Type Safety**: TypeScript & [Zod](https://zod.dev/) for schema validation

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18 or newer recommended)
- [Expo Go](https://expo.dev/expo-go) app installed on your physical device for testing.
- [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`) for production builds.

### Local Development
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/zorvyn-mobile.git
    cd zorvyn-mobile
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start Expo**:
    ```bash
    npx expo start
    ```
    *Scan the QR code with your device to see the app in action.*

### Building the APK (Android)
To generate a preview APK using Expo Application Services (EAS):
```bash
eas build --platform android --profile preview
```

---

## 🧠 Technical Assumptions

- **Local-First Privacy**: All transaction data and goals are stored locally on the device. No data is sent to external servers, ensuring maximum privacy.
- **State Persistence**: The app assumes a persistent state model. Closing the app or restarting the device will not lose your history or settings.
- **Android Platform Bias**: While cross-platform, current UI refinements and navigation patterns (BottomSheet, FAB) are optimized for modern Android devices.
- **Currency Model**: The app assumes a single-currency environment per profile to simplify calculation logic and maximize accuracy.

---

## 🎨 Design Philosophy

Zorvyn implements a **"Modern Premium"** design language:
-   **Density & Breathing Room**: High-density data views paired with generous whitespace for clarity.
-   **Color Science**: High-contrast tokens for Income (Emerald) and Expenses (Rose) for intuitive reading.
-   **Responsive Layouts**: Utilizing flexible box models to support varying screen sizes and font scaling.

---

Designed with ❤️ for better financial health.
