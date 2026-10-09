# Meadows Lingo · تعلّم العربية

Arabic practice for MOE Arabic A and DP Arabic B students: lessons, vocabulary, listening, writing, reading and IBT-style practice tests. It has three kinds of login:

- **Admin:** manages teachers, classes, students and course content, sees every class, and exports reports.
- **Teachers:** see their own classes' progress, set homework, and view the gradebook.
- **Students:** sign in with a 6-character code. Their progress and results are saved automatically and their teacher can see them.

The site is hosted on GitHub Pages and uses Firebase for logins and data.

**To set it up, follow [SETUP.md](SETUP.md).** Until Firebase is connected, the site runs in demo mode, saving data only in your browser.

## Themes, artwork and your voice

- **Themes:** each topic is a theme with its own illustration and colour (`js/art.js`). A theme has stages: words, listen & spell, sentences, listening, reading, a writing task and a review. Students' writing is sent to the teacher, who can read it in the student's history.
- **Lesson content:** Years 7, 8, 10 and 11 include Ms. Fardoos Nagi's lesson materials (2026-27).
- **Your voice:** open `recorder.html` (also linked from Admin → Content), record the texts, download the zip and upload everything in it to `audio/voice/`. The site plays your recordings first, then the built-in clips, then the device's voice.
- **Painted pictures instead of drawings:** put a picture in `img/themes/<theme-id>.jpg` and add the id to `window.ART_PHOTOS` at the top of `js/art.js`.
