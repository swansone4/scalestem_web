# ScaleStem

A standalone, responsive computational research community website for ScaleSTEM. The site runs from this repository, with no Wix dependency, third-party framework, build step, hosted font, or remote image dependency.

## Run locally

Requires Node.js 20.11 or newer.

```sh
npm run dev
```

Open [http://localhost:4173](http://localhost:4173). Set `PORT` to use another port. `npm start` runs the same server.

## Deploy

The static site in `public/` can be served by any static web host. For a persistent Node host, run `npm start`; it listens on `PORT` and binds to `0.0.0.0`.

## Pages

- `/` — Home
- `/about` — Mission and five-step methodology
- `/programs` — Overview of the 8–12 week mentored cohort
- `/apply` — Prospective student interest form
- `/mentor` — TA and mentor interest
- `/journal` — Research journal overview
- `/contact` — Contact form

Forms validate in the browser and open a pre-filled email addressed to `scalestem@gmail.com` for the visitor to review and send. Nothing is submitted automatically or stored by this site. The student form registers interest only; it does not promise a cohort start date or placement.
