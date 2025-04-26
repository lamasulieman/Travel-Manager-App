import { getFirestore, collection,onSnapshot, addDoc, getDocs, query, where,doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "./authController"; 
import { app } from "../services/firebaseConfig";

const db = getFirestore(app);
const storage = getStorage(app);

export const addTrip = async (tripName, startDate, endDate) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in.");

  const userRef = doc(db, "users", user.uid);

  const docRef = await addDoc(collection(db, "Trips"), {
    tripName,
    startDate,
    endDate,
    createdBy: userRef,
    createdAt: new Date()  
  });

  return docRef.id;
};
// Edit Trip
export const updateTrip = async (tripId, updatedFields) => {
  const tripRef = doc(db, "Trips", tripId);
  await updateDoc(tripRef, updatedFields);
};

//  Delete Trip
export const deleteTrip = async (tripId) => {
  const tripRef = doc(db, "Trips", tripId);

  try {
    // Delete activities
    const activitiesSnapshot = await getDocs(collection(db, "Trips", tripId, "activities"));
    const activityDeletions = activitiesSnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "Trips", tripId, "activities", docSnap.id))
    );

    // Delete expenses
    const expensesSnapshot = await getDocs(collection(db, "Trips", tripId, "expenses"));
    const expenseDeletions = expensesSnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "Trips", tripId, "expenses", docSnap.id))
    );

    // Wait for all activities and expenses to be deleted
    await Promise.all([...activityDeletions, ...expenseDeletions]);

    // Now delete the trip itself
    await deleteDoc(tripRef);

  } catch (error) {
    console.error("Error deleting trip and subcollections:", error);
    throw error;
  }
};

export const updateActivity = async (tripId, activityId, updatedData) => {
  const activityRef = doc(db, "Trips", tripId, "activities", activityId);
  await updateDoc(activityRef, updatedData);
};
export const deleteActivity = async (tripId, activityId) => {
  const activityRef = doc(db, "Trips", tripId, "activities", activityId);
  await deleteDoc(activityRef);
};


export const addExpenseToTrip = async (tripId, name, category, amount) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in.");

  await addDoc(collection(db, "Trips", tripId, "expenses"), {
    name, 
    category, 
    amount: Number(amount), 
    createdBy: user.uid,
  });
};



export const fetchExpenses = async (tripId) => {
  if (!tripId) return [];

  try {
    const expensesCollectionRef = collection(db, "Trips", tripId, "expenses");
    const querySnapshot = await getDocs(expensesCollectionRef);

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
};

export const updateExpense = async (tripId, expenseId, updatedData) => {
  const expenseRef = doc(db, "Trips", tripId, "expenses", expenseId);
  await updateDoc(expenseRef, updatedData);
};

export const deleteExpense = async (tripId, expenseId) => {
  const expenseRef = doc(db, "Trips", tripId, "expenses", expenseId);
  await deleteDoc(expenseRef);
};

export const uploadFile = async (file, tripId) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("User not logged in.");
    alert("You must be logged in to upload files.");
    return;
  }

  const storageRef = ref(storage, `uploads/${user.uid}/${file.name}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    await addDoc(collection(db, "users", user.uid, "files"), {
      name: file.name,
      url: downloadURL,
      uploadedAt: new Date().toISOString(),
      tripId, //  associate with trip
    });

    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    alert("Failed to upload file. Check console for details.");
  }
};

export const fetchTripFiles = async (tripId) => {
  const user = auth.currentUser;
  if (!user) return [];

  const filesCollection = collection(db, "users", user.uid, "files");
  const q = query(filesCollection, where("tripId", "==", tripId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserTrips = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const userRef = doc(db, "users", user.uid); // reference to the user doc
  const tripsRef = collection(db, "Trips");
  const q = query(tripsRef, where("createdBy", "==", userRef));

  const snapshot = await getDocs(q);
  const trips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return trips;
};

export const addActivityToTrip = async (tripId, name, date, time, location, notes) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in.");

  await addDoc(collection(db, "Trips", tripId, "activities"), {
    name,
    date,
    time,
    location,
    notes,
    createdBy: user.uid,
  });
};

export const subscribeToActivities = (tripId, onUpdate) => {
  const activitiesRef = collection(db, "Trips", tripId, "activities");

  return onSnapshot(activitiesRef, (snapshot) => {
    const activities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    onUpdate(activities);
  });
};
export const subscribeToExpenses = (tripId, onUpdate) => {
  const expensesRef = collection(db, "Trips", tripId, "expenses");

  return onSnapshot(expensesRef, (snapshot) => {
    const updatedExpenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    onUpdate(updatedExpenses);
  });
};