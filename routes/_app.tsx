import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Charity Shelter Admin</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Check for saved theme preference or use default
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
              document.documentElement.className = savedTheme;
            }
            
            // Initialize auth token from localStorage
            try {
              const authToken = localStorage.getItem('authToken');
              if (authToken) {
                console.log('Auth token found in localStorage');
                // We'll initialize this in our API client
              }
            } catch (err) {
              console.error('Error accessing localStorage:', err);
            }
          `,
          }}
        />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
