# AR Hit-Test Demo

Quick standalone WebXR prototype: point an Android phone at a floor/table, see a green reticle when ARCore detects a surface, tap to place a 3D box.

## Running for phone testing

```bash
npm install
npm run dev -- --host
```

Vite will print a **Network** URL like `https://192.168.x.x:5173`. That's what you use on the phone. If port 5173 is already in use, Vite will pick another (e.g., 5174) — use whatever it prints.

This project now uses `vite-plugin-mkcert` to serve HTTPS locally. The phone must trust the generated root CA, otherwise Chrome will refuse the connection.

## Trusting the local CA on your Android phone

1. From this laptop, serve the CA certificate over plain HTTP so the phone can download it:
   ```bash
   npx serve . --listen 8444
   ```
   (Or use any static server that exposes `ca.crt`.)
2. On the phone, open Chrome and download:
   ```
   http://192.168.1.81:8444/ca.crt
   ```
   Replace IP/port with whatever server you started.
3. Open Android **Settings → Security & privacy → More security & privacy → Install certificate from storage → CA certificate**.
4. Tap the downloaded `ca.crt` file and confirm. Android will warn you it can inspect HTTPS traffic — confirm, this is a local-only test CA.
5. Restart Chrome on the phone.

Now visit the Vite Network URL with `https://`. Chrome should not show a certificate warning.

## Phone setup (after CA is trusted)

1. Put the Android phone on the **same LAN** as this laptop (or use the laptop hotspot).
2. Browse to the Vite **Network** URL, e.g. `https://192.168.1.81:5174/`.
3. Tap **Start AR**, grant camera permission, point at a textured surface, wait for the green reticle, then tap to place boxes.

## Box dimensions

The placed box size is controlled at the top of `src/main.js`:

```js
const BOX_SIZE = { x: 0.3, y: 0.4, z: 0.3 };
```

Change those numbers (meters in AR world space) to match your product footprint.
