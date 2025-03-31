import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "./authController"; 
import { app } from "../services/firebaseConfig";

const db = getFirestore(app);
const storage = getStorage(app);

export const addTrip = async (tripName, startDate, endDate) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in.");

  const docRef = await addDoc(collection(db, "Trips"), {
    tripName,
    startDate,
    endDate,
    createdBy: user.uid,
  });

  return docRef.id; 
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
      tripId, // ✅ associate with trip
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

  const tripsQuery = query(collection(db, "Trips"), where("createdBy", "==", user.uid));
  const snapshot = await getDocs(tripsQuery);

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

export const fetchActivities = async (tripId) => {
  if (!tripId) return [];

  const activitiesCollectionRef = collection(db, "Trips", tripId, "activities");
  const querySnapshot = await getDocs(activitiesCollectionRef);

  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
