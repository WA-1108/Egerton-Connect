# Egerton Connect (demo)

A simple 18+ campus connection site built with plain HTML, CSS and JavaScript.
No install, no build step. Profiles and chats are saved in the browser only, and the people you see are samples.

## Run it on your computer (Windows)

1. Put `index.html`, `style.css` and `app.js` in one folder.
2. Double-click `index.html`. It opens in your browser.

## Put it on GitHub

1. Install Git for Windows from https://git-scm.com/download/win (accept the defaults).
2. Create an empty repository on https://github.com/new named `egerton-connect`. Do not add a README there.
3. Open the folder, click the address bar, type `cmd` and press Enter. Then run:

```
git init
git add .
git commit -m "First version of Egerton Connect"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/egerton-connect.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. If Windows asks you to sign in, use your GitHub account in the window that opens.

## Deploy on Vercel

1. Go to https://vercel.com and sign up with GitHub.
2. Click **Add New**, then **Project**, and import `egerton-connect`.
3. Leave Framework Preset as **Other**. Leave the build settings empty.
4. Click **Deploy**. In about a minute you get a live link.

Every time you run `git add .`, `git commit -m "message"` and `git push`, Vercel updates the live site automatically.

## What is not real yet

- No real accounts, so anyone can open the site and make a profile only on their own device.
- Matches and replies are simulated with sample profiles.
- Real launch needs a database and login (Supabase works well), plus a way to confirm Egerton students and to report or block users.
