# Setting up Meadows Lingo

This guide takes about 30 minutes, and you only do it once. You need:

- your GitHub account (**husseinylaura-source**)
- a Google account for Firebase (husseinylaura@gmail.com is fine)

**What each part does:**

- **GitHub Pages** hosts the website for free.
- **Firebase** (by Google, also free at school size) handles the logins and stores everyone's progress.

Until Firebase is connected, the site runs in **demo mode**. Everything works, but data is only saved in the browser you're using, so you can try it out first.

---

## Part 1: Put the site on GitHub

1. Go to **github.com** and sign in.
2. Click **New** (green button, top left), or go to github.com/new.
   - Repository name: `meadows-lingo`
   - Choose **Public**. GitHub Pages is free for public repositories. No student data is ever stored in the repository; it only holds the website code.
   - Leave everything else unticked and click **Create repository**.
3. On the new page, click **uploading an existing file**.
4. Unzip `meadows-lingo.zip` on your computer. Open the folder, select **everything inside it** (including the `audio`, `css` and `js` folders), and drag it into the GitHub page.
5. Click **Commit changes**.
6. Go to **Settings** (top of the repository) → **Pages** (left menu).
   - Under *Branch*, choose **main** and **/ (root)**, then click **Save**.
7. Wait 1–2 minutes and refresh. GitHub shows your link:
   **https://husseinylaura-source.github.io/meadows-lingo/**

Open the link. You should see the sign-in page with a blue **Demo mode** box. You can try the demo logins shown there.

---

## Part 2: Create the Firebase project

1. Go to **console.firebase.google.com** and sign in with your Google account.
2. Click **Create a project** (or *Add project*).
   - Name: `meadows-lingo`
   - Google Analytics: switch it **off**. You don't need it.
   - Click **Create project**, then **Continue**.

### Turn on logins

3. In the left menu, open **Build → Authentication** → **Get started**.
4. Under *Sign-in method*, click **Email/Password**.
   - Switch on **Email/Password** (the first switch only).
   - Click **Save**.
5. Still in Authentication, open the **Settings** tab → **Authorized domains** → **Add domain**.
   - Type `husseinylaura-source.github.io` and click **Add**.

### Create the database

6. In the left menu, open **Build → Firestore Database** → **Create database**.
   - Choose a location. **me-central1 (Doha)** is closest to the UAE; *europe-west* also works. **You can't change this later**, so check with your school if it has a data-location policy.
   - Choose **Start in production mode**, then click **Create**.
7. Open the **Rules** tab.
   - Delete everything in the box.
   - Open the file `firestore.rules` from the zip in a text editor (Notepad or TextEdit), copy all of it, and paste it into the box.
   - Click **Publish**.

### Connect the website to Firebase

8. Click the **gear icon** next to *Project Overview* (top left) → **Project settings**.
9. Scroll to **Your apps** and click the **web icon** `</>`.
   - Nickname: `Meadows Lingo`. Leave *Firebase Hosting* unticked. Click **Register app**.
10. Firebase shows some code containing `const firebaseConfig = { ... }`. Keep this page open.
11. In GitHub, open your repository → `js` folder → **config.js** → the **pencil icon** (Edit).
12. Copy each value from Firebase into the matching line, between the quotes:

```js
  firebase: {
    apiKey: "AIza…",
    authDomain: "meadows-lingo-xxxx.firebaseapp.com",
    projectId: "meadows-lingo-xxxx",
    storageBucket: "meadows-lingo-xxxx.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef…"
  }
```

13. Click **Commit changes**. Wait about a minute for the site to update.

> The apiKey is meant to be public: it only identifies your project. What protects the data are the security rules you published in step 7.

---

## Part 3: Your first sign-in (admin)

1. Open your site and look at **Staff sign in** → click **First time here?**
2. Enter **husseinylaura@gmail.com**, choose a password (at least 8 characters), and click **Create password**.
3. Firebase emails you a link. Click it, go back to the site, and press **I've confirmed my email**. (Check Junk if the email doesn't arrive.)
4. You're in as **Admin**. Open **Teachers**, click **Edit** on your own row, and set your name.

---

## Part 4: Set up the school

All of this is done from the **Admin** screens:

1. **Teachers** → **Add teacher**: enter their name and school email, and tick their classes. Then tell each teacher:
   *"Go to the site, click **First time here?** under Staff sign in, use your school email and choose a password."*
   - A teacher sees only the classes you tick for them.
   - Set someone's role to **Admin** to give them full control.
2. **Students** → **New class**: give it a name (e.g. *7A Arabic B*), a year group (this sets the topics), and its teachers.
3. Still in **Students**, paste the class's names (one per line, or a column straight from Excel) and click **Add and make codes**.
4. Click **Print login cards** and hand them out. Students go to the site and type their code. That's all they need.
5. **Content**: edit topics, words and sentences, add new topics, and add links to past papers and resources.

**What teachers see** (Classes tab):

- **Students:** each student's last activity, streak, points, lessons done, homework done, average score, and their weakest skill. Click a name for the full history and the words they often get wrong.
- **Homework:** set homework for one or several classes, and see a gradebook of who has done it.
- **Recent activity:** everything students have finished, newest first.
- **Reports:** download spreadsheets (student summary, homework gradebook, every result).

---

## Good to know

- **Lost or shared codes:** in **Students**, click **Options** next to the student → **Give a new code**. The old code stops working, and their progress is kept.
- **Student leaves:** **Options** → **Switch off**, or **Delete student**.
- **Teacher leaves:** **Teachers** → **Edit** → **Remove**, or set Status to *Switched off*.
- **Teacher forgot password:** they click **Forgot password** on the sign-in page.
- **First day with lots of new students:** each code creates an account the first time it's used, and Firebase limits how many new accounts one school network can create per hour. If a student sees *"Too many tries"*, let them try again later or roll classes out over a few lessons. After the first sign-in this no longer applies.
- **Shared devices:** students should press **Sign out** when they finish, so the next student doesn't continue as them.
- **Cost:** the free Firebase plan (Spark) covers 50,000 reads and 20,000 writes a day, which is plenty for a school. You don't need to add a card.
- **Changing the admin email:** change `ownerEmail` in `js/config.js` **and** the email in `firestore.rules` (then publish the rules again). Other admins can be added any time from the Teachers screen without editing files.
- **Privacy:** student names, codes and scores are stored in your Firebase project only. Check with your school's data protection lead before using it with students.

## Files

| File | What it is |
|---|---|
| `index.html` | Sign-in page (students and staff) |
| `app.html`, `js/app.js` | The student app |
| `staff.html`, `js/staff.js` | Teacher and admin dashboards |
| `js/data.js` | Built-in course content (topics, words, IBT questions) |
| `js/backend.js` | Logins and database |
| `js/config.js` | **Your settings: Firebase keys and admin email** |
| `firestore.rules` | Security rules to paste into Firebase |
| `audio/` | Recorded Arabic audio |
