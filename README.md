# Cairn — Editorial Digital Guestbook

Cairn is a modern, mobile-first, digital keepsake guestbook featuring AI-generated visual aesthetics, dynamic event configuration, and interactive media memories. 

Guests "add a stone" to a virtual cairn by leaving written messages, hand-drawn canvas scribbles, photos, or video greetings. The host can then compile and download these keepsakes as high-fidelity interactive offline web bundles, printable PDF books, or stitched compilation reels.

## Features

- **Editorial Landing Page & Host Dashboard**: A premium, minimalist hero layout with overlapping preview cards, custom account sign-up/login, and a host metrics panel.
- **Dynamic Event Categories**: Customized form flows for **Weddings**, **Anniversaries**, **Birthdays**, **Graduations**, and **Memorials** that adjust input fields, welcome text prompts, and filenames automatically.
- **Visual Vibe Palette Engine**: Seamless palette presets (Cream, Slate, Forest, Apricot, Dark) and live custom background color pickers.
- **Responsive Live Preview Mockup**: A realistic phone mockup that shows typography adjustments (Serif/Sans pairings) and layout changes in real-time.
- **Multimodal Entry Types**:
  - **Written Messages**: Minimalist text fields with signature names.
  - **Hand-drawn Scribbles**: Full-screen signature canvas with brush color chips, undo/redo logs, stroke weight adjusters, and touchscreen support.
  - **Photos**: Local file upload selectors rendering grid thumbnails with custom guest captions.
  - **Videos**: Local video file uploads/captures with a native HTML5 responsive player for instant playback.
- **Three Keepsake Formats**:
  - **Printable PDF Book**: Formatted for double-column layouts, hiding menus, and automatically placing scannable QR codes in place of videos.
  - **Offline Interactive Web Bundle**: Standard standalone `.html` bundle compilation with all media embedded, ready for offline local archives.
  - **Stitch MP4 Reel**: Typewriter-simulated background stitching and compilation video download.

## Running Locally

Simply serve the project folder using any local HTTP static server. For example:

```bash
# Using Python
python -m http.server 8080

# Using Node (npx)
npx http-server -p 8080
```

Open `http://localhost:8080/` in your browser to interact with the onboarding walkthrough, dashboard, and guestbook views.

## License

MIT License. Developed pair-programmed with Antigravity AI.
