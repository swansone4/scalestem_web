# ScaleStem

A standalone, responsive one-page website for the ScaleSTEM computational research community. It runs from this repository without Wix, a third-party framework, a build step, hosted fonts, or remote images.

## Run locally

Requires Node.js 20.11 or newer. No package installation is needed.

```sh
node server.js
```

Open [http://localhost:4173](http://localhost:4173). Set `PORT` to use another port. If npm is installed, `npm run dev` and `npm start` run the same server.

## Deploy

The static site in `public/` can be served by any static web host. For a persistent Node host, run `npm start`; it listens on `PORT` and binds to `0.0.0.0`.

## Homepage

The homepage leads with the job-search evidence gap, then shows the solution in a before/after resume comparison. A clearly labeled, animated mock desktop pairs a job application tracker with a Gmail-style inbox and local LinkedIn and Indeed logo files. Its applications and emails are fictional; the mockup is not connected to any of those services. The page highlights the added project and modeling skills, and lets visitors inspect either resume on hover or keyboard focus. The fictional before/after resume is also typeset in LaTeX in `resume-example/main.tex`.

The locally served LinkedIn and Indeed SVG assets are sourced from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Linkedin-logo-blue-In-square-40px.svg) and [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Indeed_logo.svg). Their respective brand marks remain the property of their owners.

The process and examples describe the intended experience. Project results vary, and the site does not guarantee employment or admission.

The interest form validates in the browser and opens a pre-filled email addressed to `scalestem@gmail.com` for the visitor to review and send. Nothing is sent automatically or stored by this site. The form registers interest in a future cohort; no launch date or placement is confirmed.
