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

The homepage shows an illustrative resume transformation, an interactive three-month project timeline, and three outcomes: a project bullet, a technical write-up developed with mentor/graduate-student feedback, and a project the student can discuss. Examples are illustrative; individual project results will vary.

The interest form validates in the browser and opens a pre-filled email addressed to `scalestem@gmail.com` for the visitor to review and send. Nothing is sent automatically or stored by this site. The form registers interest in a future cohort; timing and placement are not confirmed. The site does not guarantee employment or admission outcomes.
