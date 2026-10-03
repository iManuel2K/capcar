# Google Calendar and Gmail connection

CapCar's `/account/connections` flow uses a direct Google OAuth 2.0 web-server
connection. It reads upcoming calendar event dates, reads only Gmail metadata
(subject and date), and creates a calendar event only after the owner presses
the button on an individual trip plan.

## Google Cloud setup

1. Create or select a Google Cloud project.
2. Enable **Google Calendar API** and **Gmail API**.
3. Configure the OAuth consent screen and add the intended test users while the
   app remains in testing.
4. Create an OAuth client with application type **Web application**.
5. Register the production callback exactly:

   `https://capcar.dev/api/connections/google/callback`

6. Set the server-only Netlify variables:

   - `GOOGLE_OAUTH_CLIENT_ID`
   - `GOOGLE_OAUTH_CLIENT_SECRET`
   - `GOOGLE_CONNECTION_ENCRYPTION_KEY` (at least 32 random characters)
   - `SUPABASE_SECRET_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://capcar.dev`

7. Apply `supabase/migrations/20261003160033_external_connections.sql`.

The Gmail metadata scope can require Google's app-verification process before
general public access. Test-user accounts can use the connection while the
OAuth app is in testing.

## Security boundaries

- OAuth uses state plus PKCE and an HttpOnly, SameSite=Lax, short-lived cookie.
- Access and refresh tokens are AES-256-GCM encrypted before database storage.
- The connection table is revoked from browser roles and accessed only through
  authenticated server routes.
- No email body scope is requested.
- Disconnecting deletes the connection record; deleting the CapCar account
  removes it through the `auth.users` foreign-key cascade.
