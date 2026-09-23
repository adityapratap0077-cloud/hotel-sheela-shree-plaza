# Hotel Sheela Shree Plaza — Website Concept

A designer website concept for **Hotel Sheela Shree Plaza**, Jhansi (Uttar Pradesh, India) — opposite Medical College Gate No. 1, Kanpur Road.

## What's inside

- **Design system** — champagne-gold on deep ink; Cormorant Garamond + Jost, self-hosted (no external font requests)
- **Real photography** — 9 genuine photos from the hotel's Google Maps listing (`img/real/`)
- **Real guest reviews** — 6 verbatim reviews from Google Maps & Tripadvisor, with the live 3.8★ / 2,481-review aggregate
- **Official branding** — the hotel's actual logo, restored as a transparent PNG (`img/real/logo-light.png`, `img/real/logo-dark.png`)
- Sections: cinematic hero, booking bar, story + stats, rooms, amenities, Aroma & Food Xpress dining, banquets (Swagat / Satkar / Utsav), gallery with lightbox, guest reviews, Jhansi explorer, contact / booking form (mailto-based)
- Fully responsive with a mobile drawer menu; zero console errors

## Run locally

```bash
cd hotel-sheela-shree
python3 -m http.server 8321
# open http://localhost:8321/
```

No build step — pure HTML/CSS/JS. Deploy as a static site (e.g. Vercel).

## Notes

- Room prices (₹2,199 / ₹2,999) and some details were sourced from archived pages — confirm with the hotel before any public launch.
- Maps photos are guest-uploaded; get the hotel's sign-off or replace with their own photography before going public.
