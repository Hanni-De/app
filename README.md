# Health Journey Companion

This is a Next.js application built in Firebase Studio.

## Running Locally

1.  Install dependencies: `npm install`
2.  Make sure to add your Firebase credentials to a `.env` file.
3.  Run the development server: `npm run dev`
4.  Open [http://localhost:9002](http://localhost:9002) with your browser.

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
