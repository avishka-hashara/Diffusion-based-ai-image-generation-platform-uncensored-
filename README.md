#### The Daily Startup Guide

Whenever you want to run your app from a cold start, follow this sequence to get all four layers talking to each other again:

**1. Start the Generative Engine (Stable Diffusion)**

* Navigate to `E:\Personal Projects\uncensored-image-generator\stable-diffusion-webui`.
* Double-click `webui-user.bat`.
* Wait until the terminal says `Running on local URL: http://127.0.0.1:7860`.

**2. Open the Bridge (Ngrok)**

* Open a new Command Prompt in `E:\Personal Projects\uncensored-image-generator`.
* Run your tunnel command: `ngrok http 7860 --basic-auth="admin:mysecretpassword"`
* Copy the brand new `https://....ngrok-free.app` URL it gives you.

**3. Update the Orchestrator (Backend .env)**

* Open your `E:\Personal Projects\uncensored-image-generator\backend\.env` file.
* Paste the new Ngrok URL into the `SD_NGROK_URL` variable. Save and close the file.

**4. Start the Orchestrator (Backend API)**

* Open a new Command Prompt in `E:\Personal Projects\uncensored-image-generator\backend`.
* Run `venv\Scripts\activate` to turn on the Python environment.
* Run `uvicorn main:app` to start the server.

**5. Start the Presentation Layer (React Frontend)**

* Open your final Command Prompt in `E:\Personal Projects\uncensored-image-generator\frontend`.
* Run `npm run dev`.
* Open `http://localhost:5173` in your browser.
