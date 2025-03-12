import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../services/firebaseConfig";

export const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Sign up a new user and store them in Firestore
 */
export const signUpUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user info in Firestore
    await setDoc(doc(db, "Users", user.uid), {
      email: user.email,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

/**
 * Log in an existing user
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

/**
 * Log out the current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

/**
 * Check if a user is logged in
 */
export const checkAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};
