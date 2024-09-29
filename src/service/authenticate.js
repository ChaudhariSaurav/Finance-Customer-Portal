import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { get, ref, set } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { auth, database, storage } from "../config/firebase";
import { FirebaseError } from "firebase/app";
import useDataStore from "../zustand/userDataStore";
import Razorpay from "razorpay";






const generateCustomerId = (loanType, totalEmiMonths, currentYear, firstName, lastName, position) => {
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const yearSuffix = String(currentYear).slice(-2);
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  const positionCategory = position <= 10 ? 'A' : position <= 100 ? 'B' : position <= 10000 ? 'C' : 'D';
  
  return `${currentMonth}${loanType}${totalEmiMonths}${yearSuffix}${firstInitial}${lastInitial}${positionCategory}`;
};


// Add this function to handle creating the initial installment entry
const calculateFixedEMI = (loanValue) => {
  const emiRates = {
    10000: 1135,
    20000: 2270,
    30000: 2750,
    40000: 3225,
    50000: 3385,
  };

  return emiRates[loanValue] || 0; // Return 0 if loanValue is not supported
};

const createInitialInstallment = async (uid, loanValue, totalEmiMonths) => {
  const installmentRef = ref(database, `installments/${uid}`);
  const installments = [];
  
  for (let i = 1; i <= totalEmiMonths; i++) {
    const emi = calculateFixedEMI(loanValue);
    
    installments.push({
      month: i,
      amount: emi,
      status: i === 1 ? 'Pending' : 'Upcoming',
      dueDate: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days apart
    });
  }

  // Save installments to the database
  await set(installmentRef, installments);
};


const handleUploadFiles = async (filesArray, user, documentType, userDetails) => {
  try {
    const docRef = ref(database, `users/${user.uid}/documents/${documentType}`);
    const docSnapshot = await get(docRef);

    if (docSnapshot.exists()) {
      throw new Error("Documents already uploaded for this category.");
    }

    const uploadPromises = filesArray.map(file => {
      const fileRef = storageRef(storage, `documents/${user.uid}/${documentType}/${file.name}`);
      return uploadBytes(fileRef, file);
    });

    const uploadResults = await Promise.all(uploadPromises);
    const fileUrls = await Promise.all(uploadResults.map(result => getDownloadURL(result.ref)));

    await set(ref(database, `users/${user.uid}/documents/${documentType}`), {
      ...userDetails,
      fileUrls,
      uploadedAt: new Date().toISOString(),
    });

    return fileUrls;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

const registerUser = async (email, password, firstName, lastName, dateOfBirth, mobile, photo, loanType, totalEmiMonths, loanValue) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uid = user.uid;

    let photoURL = null;
    if (photo) {
      const profileImageRef = storageRef(storage, `profileImages/${uid}/${photo.name}`);
      await uploadBytes(profileImageRef, photo);
      photoURL = await getDownloadURL(profileImageRef);
      await updateProfile(user, { photoURL });
    }

    const userCountRef = ref(database, 'users');
    const userSnapshot = await get(userCountRef);
    const position = userSnapshot.exists() ? Object.keys(userSnapshot.val()).length + 1 : 1;

    const currentYear = new Date().getFullYear();
    const customerId = generateCustomerId(loanType, totalEmiMonths, currentYear, firstName, lastName, position);

    const existingSnapshot = await get(userCountRef);
    if (existingSnapshot.exists() && Object.values(existingSnapshot.val()).some(user => user.customerId === customerId)) {
      throw new Error("Customer ID already exists. Please try again.");
    }

    await set(ref(database, `users/${uid}`), {
      uid,
      firstName,
      lastName,
      email,
      mobile,
      dateOfBirth,
      photoURL,
      customerId,
      loanType,
      totalEmiMonths,
      loanValue,
      position,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await createInitialInstallment(uid, loanValue, totalEmiMonths);

    return { user: { id: uid, name: firstName, email: user.email || '' }, customerId };
  } catch (error) {
    console.error("Error during registration:", error);
    throw new Error(error instanceof FirebaseError ? error.message : "An unknown error occurred during registration.");
  }
};

const userLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    useDataStore.getState().setUser(user);
    window.location.replace("/dashboard");
    return user;
  } catch (error) {
    console.error("Error during login:", error);
    switch (error.code) {
      case "auth/user-not-found":
        throw new Error("User not found");
      case "auth/wrong-password":
        throw new Error("Incorrect password");
      default:
        throw new Error("An error occurred during login. Please try again.");
    }
  }
};

const userSignOut = async () => {
  try {
    await signOut(auth);
    useDataStore.getState().clearUser();
    localStorage.removeItem("UserData");
    localStorage.clear();
    window.location.replace("/");
  } catch (error) {
    console.error("Error during sign out:", error);
    throw new Error("An error occurred during sign out. Please try again.");
  }
};

// New function to handle forgot password
const handleForgotPassword = async (email) => {
  try {
    // Check if the email exists in the database
    const userRef = ref(database, `users`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      throw new Error("No users found in the database.");
    }
    
    const users = snapshot.val();
    const userExists = Object.values(users).some(user => user.email === email);

    if (!userExists) {
      throw new Error("No account associated with this email.");
    }

    // If the email exists, send the password reset email
    await sendPasswordResetEmail(auth, email);
    return "Password reset email sent. Please check your inbox.";
    
  } catch (error) {
    console.error("Error in handleForgotPassword:", error);
    switch (error.code) {
      case "auth/invalid-email":
        throw new Error("Invalid email address.");
      case "auth/user-not-found":
        throw new Error("No account associated with this email.");
      default:
        throw new Error("An error occurred while sending the email. Please try again.");
    }
  }
};

export {
  registerUser,
  userLogin,
  handleUploadFiles,
  userSignOut,
  handleForgotPassword, // Exporting the new function
};
