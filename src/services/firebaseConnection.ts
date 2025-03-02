
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDnMbSg9hB3waiVhgKGncrclZUJcbj8QlI",
  authDomain: "tarefasplus-9c7f2.firebaseapp.com",
  projectId: "tarefasplus-9c7f2",
  storageBucket: "tarefasplus-9c7f2.firebasestorage.app",
  messagingSenderId: "616675347210",
  appId: "1:616675347210:web:39c75f209aa89a3a3d08f3"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };