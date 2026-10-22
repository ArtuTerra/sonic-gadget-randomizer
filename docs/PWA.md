# PWA

## What is a PWA?

A progressive web app is a normal website plus two extra pieces:

- A **web app manifest** (name, colours, icons) so Android can install it like an app.
- A **service worker**, a small script the browser keeps in the background. On the first visit it downloads the app's files (HTML, JavaScript, CSS, icons, and the gadget data) and stores them. After that the app can open **with no internet connection**.

On Android, Chrome then offers **Install app** or **Add to Home screen**. The icon opens full screen, without the browser address bar. The next time you are online, the service worker picks up a new version on its own.

This project uses [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/), which generates the manifest and the service worker from the Vite build. You do not write the service worker by hand.

## Install the PWA on Android

Do this after the site is deployed (the phone needs an `https://` address; your computer's `localhost` is not the phone's localhost).

1. On the phone, open the `*.pages.dev` or `*.vercel.app` URL in **Chrome**.
2. Wait for the page to finish loading so the service worker can cache the files.
3. Open the Chrome menu (the three dots) and tap **Install app** or **Add to Home screen**.
4. Open the new home-screen icon. It should launch full screen, without the address bar.
5. Turn on airplane mode and open the icon again. The cached page should still load.

After the first online load, airplane mode should still open the app, show the icons, and roll a new build. The gadget icons are part of the service worker precache.

To test offline mode locally, see [Development](DEVELOPMENT.md#scripts).
