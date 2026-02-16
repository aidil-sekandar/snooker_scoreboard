# Online Snooker Scoreboard

Real-time snooker scoreboard for two players, built with Astro + React + TypeScript.

## Version

`v1.0.0`

## License

This project is licensed under the MIT License. See `LICENSE`.

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

## How Scoring Flow Works

1. Pot a red (`1`) first.
2. Then pot a color (`2` to `7`).
3. Continue red -> color until all 15 reds are gone.
4. After the final red and its required color, enter sequence mode.
5. Sequence mode allows only: yellow -> green -> brown -> blue -> pink -> black.

## Contributing

Contributions are welcome through issues and pull requests.

