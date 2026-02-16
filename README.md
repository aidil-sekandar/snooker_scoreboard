# Online Snooker Scoreboard

Real-time snooker scoreboard, built with Astro + React + TypeScript.

<img width="1508" height="940" alt="image" src="https://github.com/user-attachments/assets/423fc26e-5375-4c3d-9b39-759c73a045d1" />

## Version

`v1.0.0`

## Highlights

- Pre-match setup:
  - Match title
  - Player names
  - Number of frames
- Real-time scoring for both players
- Turn highlight (`Your Turn`)
- Live frame timer
- Current break tracking
- Frame score tracking and match winner detection
- Snooker ball-rule enforcement:
  - Red <-> color alternation while reds remain
  - 15-red handling
  - Automatic transition to color clearance sequence
  - Sequence order enforcement: yellow -> green -> brown -> blue -> pink -> black
- Active/inactive ball controls:
  - Only legal ball is clickable
  - Illegal balls are disabled and greyed out
- Foul flow:
  - Foul mode
  - Selectable foul points: 4, 5, 6, 7
- Marking timeline + robust undo:
  - Global event history for pots/misses/fouls
  - Undo restores full previous state (scores, turn highlight, expected ball, sequence state)
- Per-player pot history panel:
  - Pot markers by ball color
  - Foul markers shown as grey circles with foul points
  - Miss events are kept in state history but hidden from pot history UI
- End-turn, end-frame, end-match controls
- Confirmation modals for end frame/match
- Reset to new match
- Responsive layout for desktop/tablet/mobile

## Tech Stack

- Astro
- React
- TypeScript
- TailwindCSS
- Netlify adapter (`@astrojs/netlify`)

## Run Locally

```bash
npm install
npm run dev
```

Build production output:

```bash
npm run build
npm run preview
```

## License

This project is licensed under the MIT License. See `LICENSE`.

## Contributions

Contributions are welcome through issues and pull requests.

