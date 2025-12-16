import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration with hardcoded values from user
const firebaseConfig = {
  apiKey: "AIzaSyBXZwjBtVfLG53nt5_rhU6sFRPdYG5cAqE",
  authDomain: "memorygame-9ba38.firebaseapp.com",
  projectId: "memorygame-9ba38",
  storageBucket: "memorygame-9ba38.firebasestorage.app",
  messagingSenderId: "579524465520",
  appId: "1:579524465520:web:50541d9173b704fb83f5b5",
  databaseURL: "https://memorygame-9ba38-default-rtdb.firebaseio.com",
};

let app: any = null;
let database: any = null;

export function initializeFirebase() {
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      database = getDatabase(app);
      console.log("[Firebase] Initialized successfully");
    } catch (error) {
      console.error("[Firebase] Initialization error:", error);
    }
  }
  return { app, database };
}

export function getFirebaseDatabase() {
  if (!database) {
    initializeFirebase();
  }
  return database;
}
