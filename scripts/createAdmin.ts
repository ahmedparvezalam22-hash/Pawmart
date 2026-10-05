import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import firebaseConfigData from '../firebase-applet-config.json';
import { INITIAL_PRODUCTS } from '../src/services/sampleData';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

const ADMIN_EMAIL = 'ahmedparvezalam22@gmail.com';
const ADMIN_PASSWORD = '123Par&#@';
const ADMIN_NAME = 'Parvez';

async function main() {
  console.log(`Setting up Administrator for ${ADMIN_EMAIL}...`);

  let user;
  try {
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    user = cred.user;
    console.log(`Created new Firebase Auth user with UID: ${user.uid}`);
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('User already exists in Firebase Auth, signing in to update profile...');
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      user = cred.user;
      console.log(`Signed in successfully with UID: ${user.uid}`);
    } else {
      console.error('Auth error:', err);
      process.exit(1);
    }
  }

  // Update display name
  await updateProfile(user, { displayName: ADMIN_NAME });
  console.log(`Display name updated to: ${ADMIN_NAME}`);

  // Create or update Firestore users/{uid} document
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    role: 'admin',
    createdAt: new Date().toISOString()
  }, { merge: true });
  console.log(`Firestore user document updated with role: 'admin'`);

  // Seed sample products into Firestore if empty
  const productsSnap = await getDocs(collection(db, 'products'));
  if (productsSnap.empty) {
    console.log('Seeding 20 products into Firestore database...');
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    INITIAL_PRODUCTS.forEach((prod) => {
      const docRef = doc(db, 'products', prod.id);
      batch.set(docRef, {
        ...prod,
        createdAt: now,
        updatedAt: now,
      });
    });

    await batch.commit();
    console.log('All 20 products successfully written to Firestore!');
  } else {
    console.log(`Firestore already has ${productsSnap.size} products.`);
  }

  console.log('Admin account and database initialized successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
