<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1iDZeVCyZGTv_9vL_XcqJOn9kBI__4euY

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create an `.env.local` file with the following variables:
   ```bash
   VITE_BACKEND_URL=http://127.0.0.1:8080
   VITE_CURLBUS_API_URL=https://api.curlbus.app
   VITE_CURLBUS_ROUTER_ID=israel
   VITE_OPENROUTER_API_KEY=<your-openrouter-api-key>
   VITE_OPENROUTER_MODEL=<openrouter-model-identifier>
   ```
3. Run the app:
   `npm run dev`
