import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHJSiNQeIsdnuDpvFLM7a-4DT0vLr92h8",
  authDomain: "my-project-5efe1.firebaseapp.com",
  projectId: "my-project-5efe1",
  storageBucket: "my-project-5efe1.appspot.com",
  messagingSenderId: "789539920018",
  appId: "1:789539920018:web:fee12ce3a8384f2eca2e4b",
  measurementId: "G-YFPTM4QNX7",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
