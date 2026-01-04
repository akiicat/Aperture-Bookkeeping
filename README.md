<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1yvGQFYB7A1jf_8dXFntYdGBBbSdsgsB1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Gemini

I have updated the Vite configuration to handle the @capacitor/storage import correctly. Now, I will try to build the project again.

```
npm run build
```

The build was successful. Now I will synchronize the web assets with the native iOS and Android projects.

```
npx cap sync
```

I have successfully prepared your project to run as a native iOS and Android application. The core logic has been updated, and the native project files have been generated.

Here's what you need to do next to build and run your app on each platform:

Your iOS project is now ready, but it seems you are missing some required dependencies on your machine.

Install Xcode: If you don't have it already, install Xcode from the Mac App Store. It includes the necessary tools to build and run iOS apps.
Install CocoaPods: This is a dependency manager for iOS projects. Open your terminal and run the following command:
```
sudo gem install cocoapods
```

Sync and Open: Once Xcode and CocoaPods are installed, run the following commands in your project's root directory:
```
npx cap sync ios
npx cap open ios

```

The first command will install the necessary native dependencies for your iOS project. The second will open your project in Xcode, where you can build and run it on a simulator or a physical device.
Install Android Studio: If you don't have it already, download and install Android Studio.
Open Project: Run the following command in your project's root directory:
npx cap open android


This will open your project in Android Studio. From there, you can build the app and run it on an emulator or a connected Android device.
Your web project is now a cross-platform application! You can continue developing your app in the web project, and whenever you make changes, just run npm run build and npx cap sync to update your native iOS and Android projects with the latest web code.
