## Initialization
> *Steps marked with blue line are for local only*
- > `mkdir ./ssl/ && sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./ssl/localhost.key -out ./ssl/localhost.crt`
- Make sure your SSL files are positioned properly in `./ssl/`
- Set up environment variables

VAR_NAME|PURPOSE
-|-
DATABASE_CLIENT|The SQL client being used
DATABASE_URL|The URL to connect to the database
PORT|Setting the port for the React server (443 for HTTPS)
REDIRECT_PORT|The port to redirect from to the proper port (80 for HTTP to HTTPS)
ROOM_COUNT|The number of conference rooms
MAILER_HOST|The host of the mailserver
MAILER_PORT|The port the host is listening on
MAILER_USER|The user to connect to
MAILER_PASS|The password of the user
SALT_ROUNDS|The amount of times to salt passwords
TOKEN_SECRET|The secret used for salting
SYSADMIN_PASS|The password to the SYSTEM ADMINISTRATOR and CR PANEL users
FRONTEND_DOMAIN|Used by the API to redirect
REACT_APP_LOCATION|The location used in meeting sharing
HTTPS|Whether the server is on HTTPS or not
SSL_CRT_FILE|The path to the SSL CRT file
SSL_KEY_FILE|The path to the SSL KEY file
- Run `npx knex migrate:latest`
- Run the `genusers` NPM script
