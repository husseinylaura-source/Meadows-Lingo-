/*  Meadows Lingo settings
    ----------------------
    1. ownerEmail: the admin account. This person can always sign in as admin.
       (It must match the email written in firestore.rules.)
    2. firebase: paste the values from Firebase console → Project settings → Your apps → Web app.
       While apiKey is empty, the site runs in DEMO MODE: everything works, but data is only
       saved in this browser, so you can try it before setting Firebase up.
*/
window.ML_CONFIG = {
  appName: "Meadows Lingo",
  ownerEmail: "husseinylaura@gmail.com",
  // Students sign in with a 6-character code. Behind the scenes each code becomes an account
  // like k7m2qp@students.meadowslingo.app. No emails are ever sent to this address.
  studentDomain: "students.meadowslingo.app",
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  }
};
