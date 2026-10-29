# Kooty app screens: HTML and CSS

A clickable prototype of the Kooty app, built with plain HTML, CSS and a small amount of JavaScript. No frameworks and no build step.

## Open it

1. Unzip the folder.
2. Open `index.html` in a browser to see every screen side by side, or open `screens/welcome.html` to tap through the app.

On a phone the screens fill the width. On a desktop they show as a phone-sized column.

The fonts (Baloo 2 and Nunito) load from Google Fonts, so you need an internet connection to see them. Without one, the browser uses a system font instead.

## What's inside

```
kooty-app/
  index.html          Screen gallery with the UX law notes for each screen
  screens/
    welcome.html      Welcome and language choice
    today.html        Today (home screen)
    calendar.html     Reminder calendar
    gas.html          Gas tracker
    gas-call.html     AI booking call
    booked.html       Refill booked
    services.html     Services (electricians, plumbers and more)
    pro.html          Pro profile and booking
    home.html         Grocery list, chores and bills
    groups.html       Turf game, fee split and food vote
    vault.html        Warranties, documents and receipts
  css/kooty.css       All styles; design tokens are at the top
  js/kooty.js         Interactions (one small handler per screen)
  assets/
    kooty-logo.png    Your logo, cropped for the welcome screen
    kooty-mark.svg    The two linked "o"s, used as the app icon
```

## What works

- The tab bar and links move between screens.
- Calendar: filter by category, tap a day to see its reminders.
- Gas tracker: the auto-book switch.
- AI booking call: the steps advance on their own, then link to the confirmation.
- Services: categories and filters change the list of pros.
- Pro profile: pick a time slot and the Book button updates.
- Home: tick grocery items, tap "I'm at the store".
- Groups: RSVP In, Maybe or Out, and vote on food.
- Vault: switch between Warranties, Documents and Receipts (arrow keys work too).

Every screen's HTML already holds its starting state, so it still reads correctly with JavaScript turned off.

## Design tokens

All colours, corner radii and fonts are CSS variables in the `:root` block at the top of `css/kooty.css`. The main ones:

| Token | Value | Use |
|---|---|---|
| `--green` | #4CB36A | Brand, highlights, progress |
| `--ink` | #0F3D3E | Text |
| `--teal` | #0F4C4A | Main buttons |
| `--cream` | #FCF8EE | Background |
| `--amber` | #E8742A | Urgent alerts only |
| `--green-ink` | #237A43 | Green text (passes 4.5:1) |

## Notes for developers

- Every tap target is at least 44 px, and text contrast is at least 4.5:1.
- Controls are real `<button>`, `<a>`, `<input>` and `<details>` elements, with labels for screen readers.
- Colour is never the only signal. Calendar categories also have their own icon, and status always has text.
- Names, amounts and dates are sample content. Anything in [brackets], such as [Your agency name] or [Store name], is a placeholder for real data.
- Ads appear as one clearly labelled "Sponsored" card per screen. The Vault has none.
