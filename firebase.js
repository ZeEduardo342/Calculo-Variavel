import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {
  initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, onSnapshot, addDoc, setDoc, deleteDoc, writeBatch
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDxg_KVQAt4k6vCU18AdY_c69egh4kxn34",
  authDomain: "bonus-calculator-5327e.firebaseapp.com",
  projectId: "bonus-calculator-5327e",
  storageBucket: "bonus-calculator-5327e.firebasestorage.app",
  messagingSenderId: "154701438818",
  appId: "1:154701438818:web:b7efa26920992b3e49163b"
};

const app = initializeApp(firebaseConfig);

// Cache local persistente (funciona offline e entre abas). Se o navegador não
// suportar IndexedDB, cai para o Firestore padrão (cache em memória).
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch (err) {
  console.warn('Cache persistente indisponível, usando cache em memória.', err);
  db = getFirestore(app);
}

export { db, collection, doc, onSnapshot, addDoc, setDoc, deleteDoc, writeBatch };
