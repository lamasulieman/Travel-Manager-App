import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { auth } from "./authController"; // ✅ Import auth from authController
import { app } from "../services/firebaseConfig";

const db = getFirestore(app);

/**
 * Function to add a new trip for the logged-in user
 */
export const addTrip = async (tripName, startDate, endDate) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in.");

  try {
    await addDoc(collection(db, "Trips"), {
      tripName,
      startDate,
      endDate,
      createdBy: user.uid,
    });
  } catch (error) {
    console.error("Error adding trip:", error);
    throw error;
  }
};

/**
 * Function to get trips for the logged-in user
 */
export const getUserTrips = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const tripsQuery = query(collection(db, "Trips"), where("createdBy", "==", user.uid));
    const snapshot = await getDocs(tripsQuery);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw error;
  }
};

export const addActivityToTrip = async (tripId, name, time, location, notes) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in.");
  
    try {
      await addDoc(collection(db, "Trips", tripId, "activities"), {
        name,
        time,
        location,
        notes,
        createdBy: user.uid,
      });
    } catch (error) {
      console.error("Error adding activity:", error);
      throw error;
    }
  };
