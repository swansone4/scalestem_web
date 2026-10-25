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

The homepage follows the pathway from a student questionnaire, through a three-month learning and research project, to applying with stronger evidence. It compares two complete sample resumes, highlights the added project and modeling skills, and lets visitors inspect either resume on hover or keyboard focus. The fictional before/after resume is also typeset in LaTeX in `resume-example/main.tex`.

The process and examples describe the intended experience. Project results vary, and the site does not guarantee employment or admission.

The interest form validates in the browser and opens a pre-filled email addressed to `scalestem@gmail.com` for the visitor to review and send. Nothing is sent automatically or stored by this site. The form registers interest in a future cohort; no launch date or placement is confirmed.
