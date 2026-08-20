# Accessible DOM Card Battler

A playable turn-based duel built from semantic buttons, hit-point meters, and a live region.

## Why this architecture

The match is a sequence of explicit card choices. DOM controls already provide keyboard operation, visible focus, and announcements. A canvas loop or worker would not serve those requirements.

## How to play

- Three cards: Strike (6 damage), Guard (5 block), Mend (5 heal).
- The Ash Warden cycles Strike 5, Slam 8, Recover 3.
- Arrow keys move between cards; Enter/Space plays the focused card.
- Restart returns to a fresh duel without reloading the page.

Settings (`schemaVersion: 1`) persist a local win count in `localStorage` when storage is available.
