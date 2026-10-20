# Tanmay’s Cloud Lab

A student-built portfolio for AWS Cloud, DevOps, Linux operations, and learning in public. It is a small Node.js app with no third-party runtime packages. The Gemini chat runs through a same-origin server route so the API key never goes to the browser.

## Run locally

Requires Node.js 20 or later. In PowerShell, set a **new, rotated** Gemini key in the environment for this terminal session, then start the site:

```powershell
$env:GEMINI_API_KEY = "YOUR_NEW_GEMINI_KEY"
npm start
```

Open <http://localhost:4173>. The key is read only by `server.js`; it is never written to the website files. Without a Gemini key, the portfolio bot uses simple built-in answers. GitHub Pages also uses this local bot because Pages cannot run the Node.js server.

Check JavaScript syntax with `npm run check`.

## Important: rotate the key shared in chat

The API key pasted into the conversation should be treated as exposed. Revoke it in the [Google AI Studio API Keys page](https://aistudio.google.com/apikey), create a replacement key, restrict it to the Gemini API, then set that new value as `GEMINI_API_KEY` in your local terminal or hosting provider’s secret settings. Do not paste it into `app.js`, HTML, GitHub, or a public chat. Google’s [key security guidance](https://ai.google.dev/gemini-api/docs/api-key) says production requests should go through a backend and that compromised keys should be replaced.

## What the AI bot can do

When the Node server has a Gemini key, the portfolio bot uses Gemini to answer recruiter questions from a server-side profile. On static hosting or without a key, a clearly labeled local bot answers common questions from built-in portfolio facts. Neither mode should invent work experience, deployments, certifications, awards, or metrics. The incident arcade is a local, simulated load-balancer troubleshooting exercise; it does not connect to AWS.

The chat sends the visitor’s question and up to the last eight chat turns to Gemini. The portfolio server does not save chat messages. The site applies a small in-memory request limit (12 requests per IP in 10 minutes), accepts same-origin requests only, and caps request size. Visitors should not enter private information.

## Deploy

Because chat needs a server-side secret, deploy this project to a Node.js host that supports environment variables and a long-running Node process. Set the start command to `npm start`, runtime to Node.js 20+, and add `GEMINI_API_KEY` in the host’s secret/environment settings. Set `HOST=0.0.0.0` if the host requires binding to all interfaces; the default is `127.0.0.1` for local use. The host should provide `PORT`.

### GitHub Pages

This repository is also ready for GitHub Pages. In the repository settings, choose **Deploy from a branch**, select `main`, and choose `/ (root)`. The portfolio and local profile bot work as a static site. Gemini requires the Node server and a private `GEMINI_API_KEY` on a Node.js host; GitHub Pages cannot run `server.js`. Never put a Gemini key in the page or frontend JavaScript.

## Project files

```text
index.html   Portfolio content, case studies, metadata
styles.css   Hand-drawn notebook theme and responsive layouts
app.js       Mobile navigation, incident arcade, local/Gemini chat UI
server.js    Static server and protected same-origin Gemini proxy
favicon.svg Engineering-inspired favicon
avatar.svg   Cloud-lab mascot
tanmay-photo.jpg Tanmay’s profile photo
resume.pdf   Tanmay’s Cloud/DevOps resume
package.json Start and syntax-check commands
```

## Update the portfolio

- Edit project write-ups in `index.html` and update the `profileContext` in `server.js` together so chatbot answers stay accurate.
- Update hands-on and currently-learning tools in `index.html` and `server.js`.
- Update GitHub and LinkedIn URLs in `index.html`.
- Replace `resume.pdf` with the current PDF, keeping the same filename, or update the resume links.
- Add an email link or certifications only when you’re ready to publish verified details.

## Safety notes

- Project diagrams describe the configured or intended design; this portfolio does not claim current live AWS deployments.
- The chatbot does not have tools to provision infrastructure, inspect private repositories, or access AWS accounts.
- The CloudPulse hero interaction is a browser-only architecture simulation; it does not call AWS or simulate measured uptime.
- No API key is included in the repository. The server does not log prompts or upstream response bodies.
- `avatar.svg` is the hand-drawn mascot used in the About section; Build, Debug, and Learn buttons change its short message.
- Add the supplied portrait as `tanmay-photo.jpg` beside `index.html` to show it in the About section. The layout crops it to a close headshot on desktop and mobile.
