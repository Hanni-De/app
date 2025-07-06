# Health Journey Companion

This is a Next.js application built in Firebase Studio.

## Running Locally

1.  **Install Dependencies:** If you haven't already, open a terminal in the project folder and run:
    ```bash
    npm install
    ```

2.  **Set Environment Variables:** Make sure you have a `.env` file in the root of the project with your Firebase credentials. Without this, authentication and database features will not work.

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

4.  **Open the App:** Open [http://localhost:9002](http://localhost:9002) with your browser to see the application.

### Developing AI Features (Optional)

This project uses Genkit for its AI features. If you want to debug or inspect the AI flows, you can run the Genkit development UI in a *separate terminal*:

```bash
npm run genkit:watch
```
This will start the Genkit developer UI, typically available at `http://localhost:4000`, where you can see traces of your AI flow runs.

## Deploying to Your Own Server

This is a standard Next.js application and can be deployed to any hosting provider that supports Node.js.

### Prerequisites

*   A server with Node.js (version 18.x or higher recommended).
*   Your project files copied to the server.
*   The Firebase project credentials set up in an `.env.local` file on your server (copy the contents of your local `.env` file).

### Deployment Steps

1.  **Install Dependencies:** On your server, navigate to the project directory and run:
    ```bash
    npm install --production
    ```

2.  **Build the Application:** Create a production-ready build of your app:
    ```bash
    npm run build
    ```

3.  **Start the Server:** Run the optimized production server:
    ```bash
    npm run start
    ```

For a more robust production setup, it is recommended to use a process manager like `pm2` to keep the application running continuously. You would typically run `pm2 start npm --name "health-app" -- start`.

It's also common practice to use a reverse proxy like Nginx or Apache to manage incoming traffic, handle SSL certificates, and forward requests to the Next.js application.

## Troubleshooting

### 'next' is not recognized...

If you see an error like `'next' is not recognized as an internal or external command`, it means the project dependencies have not been installed yet.

**Solution:** Make sure you have run the following command in the project terminal before trying to run `npm run dev`:
```bash
npm install
```
