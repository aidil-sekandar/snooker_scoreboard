# Online Snooker Scoreboard

A real-time snooker scoreboard web app built with **Astro**, **React components**, and **TypeScript**, designed to track scores, breaks, frames, and fouls for two players. Ideal for casual play, tournaments, or practice sessions. Deployed using **Netlify**.

<img width="600" alt="Screenshot 2025-12-22 045201" src="https://github.com/user-attachments/assets/daaa10ee-a43e-4d8e-bcd3-3c4801e3e0be" />

> **Note:** This app is optimized for desktop devices. It may not work correctly on smaller screens like mobile phones.

## Features

- Pre-game setup for player names and number of frames  
- Real-time scoring for both players  
- Break tracking per turn  
- Frame tracking and game-over detection  
- Live frame timer  
- Enforces red/color ball order (like real snooker rules)  
- Undo last shot functionality  
- Foul mode with selectable penalty points (4, 5, 6, 7)  
- End turn, end frame, and reset game functionality  
- Simple, responsive, and user-friendly interface  

## Technologies Used

- **Astro** – Framework  
- **React** – UI components  
- **TypeScript** – Type safety  
- **TailwindCSS** – Styling  
- **Netlify** – Deployment  

## How to Use

1. Enter player names and the number of frames.  
2. Click **Start Game**.  
3. Use the ball buttons to add points according to game rules:  
   - Red balls can only be potted when expected.  
   - Color balls can only be potted after a red.  
4. Use **Undo** to remove the last shot.  
5. Use **Foul** to add penalty points to the opponent and select the foul points.  
6. End a turn or frame using **End Turn** or **End Frame**.  
7. Reset the game anytime with **Reset Game**.  

## Contributing

Feel free to fork this project and submit pull requests. All contributions are welcome!
