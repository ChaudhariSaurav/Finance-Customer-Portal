import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
	sendPasswordResetEmail,
} from "firebase/auth";
import { get, ref, runTransaction, set } from "firebase/database";
import {
	ref as storageRef,
	uploadBytes,
	getDownloadURL,
} from "firebase/storage";
import { auth, database, storage } from "../config/firebase";
import { FirebaseError } from "firebase/app";
import useDataStore from "../zustand/userDataStore";

// Function to add notification
const addNotification = async (userId, title, description) => {
	const notificationId = new Date().getTime(); // Unique ID using timestamp
	const timestamp = new Date().toISOString();

	const notificationData = {
		id: notificationId,
		title,
		description,
		timestamp,
		status: 'visible',
	};

	try {
		// Add notification to the database
		await set(ref(database, `users/${userId}/notifications/${notificationId}`), notificationData);

		// Set a timeout to auto-remove the notification after 30 minutes (1800000 milliseconds)
		setTimeout(async () => {
			try {
				// Remove the notification from the database
				await remove(ref(database, `users/${userId}/notifications/${notificationId}`));
				console.log(`Notification ${notificationId} removed after 30 minutes.`);
			} catch (removeError) {
				console.error("Error removing notification:", removeError);
			}
		}, 1800000); // 30 minutes in milliseconds

	} catch (error) {
		console.error("Error adding notification:", error);
	}
};


// Generate customer ID
const generateCustomerId = (loanType, totalEmiMonths, currentYear, firstName, lastName, UserPosition) => {
	const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
	const yearSuffix = String(currentYear).slice(-2);
	const firstInitial = firstName.charAt(0).toUpperCase();
	const lastInitial = lastName.charAt(0).toUpperCase();

	// Determine position category based on UserPosition
	let positionCategory;
	if (UserPosition >= 1 && UserPosition <= 10) {
		positionCategory = 'A';
	} else if (UserPosition >= 11 && UserPosition <= 20) {
		positionCategory = 'B';
	} else if (UserPosition >= 21 && UserPosition <= 30) {
		positionCategory = 'C';
	} else if (UserPosition >= 31 && UserPosition <= 40) {
		positionCategory = 'D';
	} else if (UserPosition >= 41 && UserPosition <= 50) {
		positionCategory = 'E';
	} else if (UserPosition >= 51 && UserPosition <= 60) {
		positionCategory = 'F';
	} else if (UserPosition >= 61 && UserPosition <= 70) {
		positionCategory = 'G';
	} else if (UserPosition >= 71 && UserPosition <= 80) {
		positionCategory = 'H';
	} else if (UserPosition >= 81 && UserPosition <= 90) {
		positionCategory = 'I';
	} else if (UserPosition >= 91 && UserPosition <= 100) {
		positionCategory = 'J';
	} else {
		positionCategory = 'X'; // Default case if out of bounds
	}

	return `${currentMonth}${loanType}${totalEmiMonths}${yearSuffix}${firstInitial}${lastInitial}${positionCategory}`;
};


// Calculate fixed EMI
const emiRates = {
	10000: { emi: 1135, validMonths: [12] },
	20000: { emi: 2270, validMonths: [12] },
	30000: { emi: 2750, validMonths: [15] },
	40000: { emi: 3225, validMonths: [18] },
	50000: { emi: 3385, validMonths: [24] },
};

const calculateFixedEMI = (loanValue) => {
	return emiRates[loanValue] ? emiRates[loanValue].emi : 0;
};

const getAvailableMonths = (loanValue) => {
	return emiRates[loanValue] ? emiRates[loanValue].validMonths : [];
};

// Create initial installment entry
const createInitialInstallment = async (uid, loanValue, totalEmiMonths, userPosition) => {
	const installmentRef = ref(database, `CustomerInstallment/${uid}`);
	const installments = [];

	// Determine due date based on user position
	let dueDateDay;
	let category;

	if (userPosition >= 1 && userPosition <= 10) {
		dueDateDay = 2;
		category = 'A';
	} else if (userPosition >= 11 && userPosition <= 20) {
		dueDateDay = 10;
		category = 'B';
	} else if (userPosition >= 21 && userPosition <= 30) {
		dueDateDay = 4;
		category = 'C';
	} else if (userPosition >= 31 && userPosition <= 40) {
		dueDateDay = 6;
		category = 'D';
	} else if (userPosition >= 41 && userPosition <= 50) {
		dueDateDay = 8;
		category = 'E';
	} else if (userPosition >= 51 && userPosition <= 60) {
		dueDateDay = 1;
		category = 'F';
	} else if (userPosition >= 61 && userPosition <= 70) {
		dueDateDay = 3;
		category = 'G';
	} else if (userPosition >= 71 && userPosition <= 80) {
		dueDateDay = 5;
		category = 'H';
	} else if (userPosition >= 81 && userPosition <= 90) {
		dueDateDay = 7;
		category = 'I';
	} else if (userPosition >= 91 && userPosition <= 100) {
		dueDateDay = 9;
		category = 'J';
	} else {
		throw new Error("Invalid user position");
	}

	const startDate = new Date();
	startDate.setDate(dueDateDay);

	for (let i = 0; i < totalEmiMonths; i++) {
		const emi = calculateFixedEMI(loanValue);
		const dueDate = new Date(startDate);
		dueDate.setMonth(startDate.getMonth() + i);

		installments.push({
			month: i + 1,
			amount: emi,
			status: i === 0 ? 'Pending' : 'Upcoming',
			dueDate: dueDate.toISOString(),
			category: category // Add category to the installment
		});
	}

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

		// Update the corresponding document upload status
		const updateField = documentType === "customer" ? "customerDocumentUploaded" : "guarantorDocumentUploaded";
		await set(ref(database, `users/${user.uid}/${updateField}`), true);

		await addNotification(user.uid, `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Document Uploaded`, `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} has been successfully uploaded.`);

		return fileUrls;
	} catch (error) {
		console.error("Error uploading files:", error);
		throw error;
	}
};

const getUserIpAddress = async () => {
	try {
		const response = await fetch('https://api.ipify.org?format=json');
		const data = await response.json();
		return data.ip; // Return the IP address
	} catch (error) {
		console.error("Error fetching IP address:", error);
		return null; // Return null if there's an error
	}
};
const removeDocument = async (uid, documentType) => {
	const userRef = ref(database, `users/${uid}`);
	const userSnapshot = await get(userRef);
	const userData = userSnapshot.val();

	// Remove the document from the database
	await remove(ref(database, `users/${uid}/documents/${documentType}`));

	const documents = userData.documents || {};
	const customerDocumentUploaded = documents.customer ? true : false;
	const guarantorDocumentUploaded = documents.guarantor ? true : false;

	// Update the user data
	await update(userRef, {
		customerDocumentUploaded,
		guarantorDocumentUploaded
	});
};

const registerUser = async (
	email,
	password,
	firstName,
	lastName,
	dateOfBirth,
	mobile,
	photo,
	loanType,
	totalEmiMonths,
	loanValue,
	documents = {},
	gender,
	showToast
) => {
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
		// Get the user's IP address
		const ipAddress = await getUserIpAddress();

		const userCountRef = ref(database, 'users');
		const userSnapshot = await get(userCountRef);
		const UserPosition = userSnapshot.exists() ? Object.keys(userSnapshot.val()).length + 1 : 1;

		// Get geolocation
		const Location = await new Promise((resolve, reject) => {
			navigator.geolocation.watchPosition(resolve, reject);
		});

		const { latitude, longitude } = Location.coords;

		// Generate customer ID
		const currentYear = new Date().getFullYear();
		const customerId = generateCustomerId(loanType, totalEmiMonths, currentYear, firstName, lastName, UserPosition);
		const existingSnapshot = await get(userCountRef);
		if (existingSnapshot.exists() && Object.values(existingSnapshot.val()).some(user => user.customerId === customerId)) {
			console.error("Customer ID already exists. Please try again.");
		}

		if (showToast) {
			showToast({
				title: "Invalid",
				description: `Customer id already exist.`,
				status: "warning",
				duration: 5000,
				isClosable: true,
			});
		}

		// Check for document uploads safely
		const customerDocumentUploaded = documents.customer && Array.isArray(documents.customer) && documents.customer.length > 0;
		const guarantorDocumentUploaded = documents.guarantor && Array.isArray(documents.guarantor) && documents.guarantor.length > 0;

		// Prepare the user data object
		const userData = {
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
			UserPosition,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			paymentHistory: [],
			customerDocumentUploaded,
			gender,
			guarantorDocumentUploaded,
			ipAddress: ipAddress || "Not available",
			latitude,
			longitude,
		};

		// Remove any undefined values from userData
		Object.keys(userData).forEach(key => {
			if (userData[key] === undefined) {
				delete userData[key];
			}
		});

		// Initialize user data in the database
		await set(ref(database, `users/${uid}`), userData);
		//   await createInitialInstallment(uid, loanValue, parseInt(totalEmiMonths), gender);
		await createInitialInstallment(uid, loanValue, parseInt(totalEmiMonths), UserPosition);
		await addNotification(uid, "Registration Successful", "Hello, " + firstName + "!");

		return { user: { id: uid, name: firstName, email: user.email || '' }, customerId };
	} catch (error) {
		console.error("Error during registration:", error);
		throw new Error(error instanceof FirebaseError ? error.message : "An unknown error occurred during registration.");
	}
};

const userLoginByEmail = async (email, password) => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;

		const userRef = ref(database, `users/${user.uid}`);
		const userSnapshot = await get(userRef);
		const userData = userSnapshot.val();

		if (userData.isLoggedIn) {
			throw new Error("User is already logged in on another device.");
		}

		console.log(userData.isLoggedIn)

		await set(userRef, { ...userData, isLoggedIn: true });
		const emailLoggedinuser = userCredential.user;
		useDataStore.getState().setUser(emailLoggedinuser);

		window.location.replace("/dashboard");

		// ... rest of the login process ...
	} catch (error) {
		console.error("Error during login:", error);
		throw error;
	}
};
const userLoginByCustomerID = async (customerId, password) => {
	try {
		const usersRef = ref(database, 'users');
		const usersSnapshot = await get(usersRef);
		const users = usersSnapshot.val();

		const user = Object.values(users).find(u => u.customerId === customerId);
		if (!user) {
			throw new Error("Customer ID not found");
		}

		if (user.isLoggedIn) {
			throw new Error("User is already logged in on another device.");
		}

		const userCredential = await signInWithEmailAndPassword(auth, user.email, password);

		await set(ref(database, `users/${user.uid}`), { ...user, isLoggedIn: true });
		const loggedInuser = userCredential.user;
		await addNotification(loggedInuser.uid, "Welcome Back!", "We're glad to see you again!");

		useDataStore.getState().setUser(loggedInuser);
		window.location.replace("/dashboard");
		return user;
	} catch (error) {
		console.error("Error during login:", error);
		throw error;
	}
};
export const fetchAllUsers = async () => {
	try {
		const usersRef = ref(database, 'users/');
		const snapshot = await get(usersRef);
		console.log('snapshot,', snapshot)
		if (snapshot.exists()) {
			return snapshot.val();
		} else {
			throw new Error("No users found.");
		}
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error; // Rethrow to handle it later
	}
};

const handleLoginError = (error) => {
	switch (error.code) {
		case "auth/user-not-found":
			alert("User not found");
			break;
		case "auth/wrong-password":
			alert("Incorrect password");
			break;
		case "customer-not-found":
			alert("Customer ID not found");
			break;
		default:
			alert("An error occurred during login. Please try again.");
	}
};

// const listenForUserStatus = (uid) => {
//     const userRef = ref(database, `users/${uid}`);

//     onValue(userRef, (snapshot) => {
//         const data = snapshot.val();
//         if (data && !data.isLoggedIn) {
//             console.log("User logged out from another device. Logging out...");
// 			throw new Error("User logged out from another device. Logging out...")
//             signOut(auth)
//                 .then(() => {
//                     useDataStore.getState().clearUser();
//                     localStorage.removeItem("UserData");
//                     localStorage.clear();
//                     window.location.replace("/");
//                 })
//                 .catch(handleLoginError);
//         }
//     });
// };

// const user = auth.currentUser;
// if (user) {
//     listenForUserStatus(user.uid);
// }

const userSignOut = async () => {
	try {
		const user = auth.currentUser;
		if (user) {
			const userRef = ref(database, `users/${user.uid}`);
			console.log("Updating user status...");

			// Update the user's isLoggedIn status to false
			await runTransaction(userRef, (currentData) => {
				if (currentData) {
					currentData.isLoggedIn = false; // Change to false on sign out
					return currentData; // Return the modified data
				}
				return null; // Abort transaction if no data
			});

			await signOut(auth);
			console.log("User signed out successfully.");

			useDataStore.getState().clearUser();
			localStorage.removeItem("UserData");
			localStorage.clear();

			window.location.replace("/");
		} else {
			console.log("No user is currently logged in.");
		}
	} catch (error) {
		handleLoginError(error);
	}
};
const handleForgotPassword = async (email) => {
	try {
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
export const handlePaymentCallback = async (paymentDetails, uid, installmentMonth, amount, showToast) => {
	const installmentRef = ref(database, `CustomerInstallment/${uid}/${installmentMonth}`);
	const userRef = ref(database, `users/${uid}`);

	// Use razorpay_payment_date from the response, or fallback to current date if not present
	const paymentDate = paymentDetails.razorpay_payment_date
		? new Date(paymentDetails.razorpay_payment_date).toISOString()
		: new Date().toISOString();

	const paidInstallment = {
		status: 'Paid',
		paymentDate,
		razorpay_id: paymentDetails.razorpay_payment_id || null,
		razorpay_order_id: paymentDetails.razorpay_order_id || null,
		razorpay_signature: paymentDetails.razorpay_signature || null,
		amountPaid: amount,
		customerId: uid,
	};

	try {
		// Fetch current due date from CustomerInstallment
		const installmentSnapshot = await get(installmentRef);
		const existingInstallmentData = installmentSnapshot.val();
		const currentDueDate = existingInstallmentData?.dueDate || null;

		if (!currentDueDate) {
			throw new Error("Due date not found for the specified installment.");
		}

		// Calculate the next due date (assuming installments are monthly)
		const nextDueDate = new Date(currentDueDate);
		nextDueDate.setMonth(nextDueDate.getMonth() + 1);
		const nextDueDateString = nextDueDate.toISOString();

		// Update the installment record for the current month with the new due date
		await set(installmentRef, {
			...paidInstallment,
			amountPaid: amount, // Set amountPaid to 0 after successful payment
			paidMonth: installmentMonth, // Add the month that has been paid
			dueDate: nextDueDateString // Update with the next due date
		});

		const paymentHistoryEntry = {
			...paidInstallment,
			installmentMonth,
			createdAt: new Date().toISOString(),
			dueDate: currentDueDate, // Include the current due date in payment history
		};

		// Fetch user data to update the payment history and stats
		const userSnapshot = await get(userRef);
		const existingPaymentHistory = userSnapshot.val()?.paymentHistory || [];
		existingPaymentHistory.push(paymentHistoryEntry);

		// Update user's payment history and total months paid
		const totalMonthsPaid = (userSnapshot.val()?.totalMonthsPaid || 0) + 1; // Increment total months paid
		const totalAmountPaid = (userSnapshot.val()?.totalAmountPaid || 0) + amount; // Increment total amount paid

		// Get the list of paid months or initialize it
		const paidMonths = userSnapshot.val()?.paidMonths || [];
		if (!paidMonths.includes(installmentMonth)) {
			paidMonths.push(installmentMonth); // Add the current month to paid months
		}

		// Update user data with the next due date and new payment history
		await set(userRef, {
			...userSnapshot.val(),
			paymentHistory: existingPaymentHistory,
			totalMonthsPaid,
			totalAmountPaid, // Save the updated total amount paid
			paidMonths,
			nextDueDate: nextDueDateString,
		});

		if (showToast) {
			showToast({
				title: "Payment Updated",
				description: `RS ${amount},  Amount paid successfully. Your next due date is ${nextDueDateString}.`,
				status: "success",
				duration: 5000,
				isClosable: true,
			});
		}
		setTimeout(() => {
			window.location.replace(`/emi/pay`); // Adjust the URL as needed
		}, 5000);

		return { success: true, message: "Payment updated successfully" };
	} catch (error) {
		console.error("Error updating installment or payment history:", error);
		if (showToast) {
			showToast({
				title: "Update Failed",
				description: "Failed to update payment information. Please try again.",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		}
		throw new Error("Failed to update payment information. Please try again.");
	}
};
export const handlePayment = async (uid, installmentMonth, amount, showToast) => {
	const loadScript = (src) => {
		return new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = src;
			script.async = true;
			script.onload = () => resolve(true);
			script.onerror = () => reject(new Error("Script load error"));
			document.body.appendChild(script);
		});
	};

	try {
		await loadScript("https://checkout.razorpay.com/v1/checkout.js");

		const options = {
			key: "rzp_test_OWxWTbj8UnSC1W",
			amount: amount * 100,
			currency: "INR",
			name: "EMI Payment",
			description: `Installment payment for month ${installmentMonth}`,
			handler: async (response) => {
				try {
					await handlePaymentCallback(response, uid, installmentMonth, amount, showToast);
					return { success: true, amount, status: "Paid" };
				} catch (error) {
					console.error("Error updating installment:", error);
					throw new Error("Payment successful but failed to update installment. Please contact support.");
				}
			},
			prefill: {
				name: "Customer Name",
				email: "customer@example.com",
			},
			theme: {
				color: "#3399cc",
			},
		};

		const paymentObject = new window.Razorpay(options);
		paymentObject.open();

		return new Promise((resolve, reject) => {
			paymentObject.on('payment.failed', (response) => {
				reject(new Error('Payment failed: ' + response.error.description));
			});

			paymentObject.on('payment.success', (response) => {
				resolve({ success: true, amount, status: "Paid", response });
			});
		});
	} catch (error) {
		console.error("Error initializing payment:", error);
		throw new Error("Failed to initialize payment. Please try again.");
	}
};
const changeUserPassword = async (customerId, oldPassword, newPassword) => {
	try {
		const allUsers = await fetchAllUsers();
		const user = Object.values(allUsers).find(user => user.customerId === customerId);

		if (!user) {
			throw new Error("Customer ID not found.");
		}

		// Sign in the user using their email and old password
		await signInWithEmailAndPassword(auth, user.email, oldPassword);

		// Update the password
		const currentUser = auth.currentUser;
		if (currentUser) {
			await updatePassword(currentUser, newPassword); // Use updatePassword here
		} else {
			throw new Error("User is not authenticated.");
		}

		return { success: true, message: "Password changed successfully." };
	} catch (error) {
		console.error("Error changing password:", error);
		throw new Error(error.message || "An error occurred while changing the password.");
	}
};
const handleForgotCustomerId = async (email) => {
	try {
		const userRef = ref(database, `users`);
		const snapshot = await get(userRef);

		if (!snapshot.exists()) {
			throw new Error("No users found in the database.");
		}

		const users = snapshot.val();
		const user = Object.values(users).find(user => user.email === email);

		if (!user) {
			throw new Error("No account associated with this email.");
		}

		const customerIdMessage = user.customerId;
		return customerIdMessage;
	} catch (error) {
		console.error("Error in handleForgotCustomerId:", error);
		throw new Error(error.message || "An error occurred while retrieving your Customer ID. Please try again.");
	}
};
// Export functions for use in other modules
export {
	generateCustomerId,
	calculateFixedEMI,
	createInitialInstallment,
	handleUploadFiles,
	registerUser,
	userLoginByEmail,
	userLoginByCustomerID,
	userSignOut,
	handleForgotPassword,
	changeUserPassword,
	removeDocument,
	addNotification,
	handleForgotCustomerId,
	getAvailableMonths
};
