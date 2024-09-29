import { initializeApp } from 'firebase/app';
import { getAuth, } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration object
const firebaseConfig = {
	apiKey: "AIzaSyBQeS0F_LHVtFyd-LDB8hBdxE0O98hNP2c",
	authDomain: "jr-groups-299d4.firebaseapp.com",
	projectId: "jr-groups-299d4",
	storageBucket: "jr-groups-299d4.appspot.com",
	messagingSenderId: "473337264700",
	appId: "1:473337264700:web:932958c317bed4cca06139",
	measurementId: "G-E5WEZVKF9G"
// 	apiKey: "AIzaSyDuAtS9V4eiP49Gq8n3-CM9TJSZdfqRNtk",

//   authDomain: "train-site.firebaseapp.com",

//   databaseURL: "https://train-site-default-rtdb.firebaseio.com",

//   projectId: "train-site",

//   storageBucket: "train-site.appspot.com",

//   messagingSenderId: "79077593679",

//   appId: "1:79077593679:web:b4db26802f729fd24d903a",

//   measurementId: "G-11B18P78Z0"


};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Create providers for Google, GitHub, and Discord

export { auth, database, storage };