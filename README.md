# Samkit & Tarushi — Wedding Invitation

A React + Vite wedding invitation website recreated around the supplied mobile reference recording. It includes a preloader, illustrated envelope entry, portrait opening video, parents' video section, countdown, scratch-to-reveal couple photo with celebratory bursts, four event videos in the requested order, and a WhatsApp RSVP form.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Replaceable media

See [`ASSET-GUIDE.txt`](./ASSET-GUIDE.txt) for exact filenames. Add the four event videos in this order: Mehendi, Hathbhara & Haldi, Sangeet, Wedding. All videos should be 9:16 portrait MP4 files.

The opening video is prepared before the invitation envelope appears. The remaining videos use staged, proximity-based preloading rather than downloading every large file at startup.

## RSVP

The RSVP form sends the guest's details to WhatsApp number +91 79082 82160. A connected form backend can be added later if you want responses stored rather than sent through WhatsApp.
