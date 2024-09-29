import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/firebase'; // Adjust the path to your Firebase config

const AllUsers = create(
  persist(
    (set, get) => ({
      users: [], // Array to store all user data
      loading: false, // State for loading status
      error: null, // State for error handling

      // Action to set users
      setUsers: (data) => set(() => ({ users: data })),

      // Action to clear users
      clearUsers: () => set(() => ({ users: [] })),

      // Action to set loading state
      setLoading: (loadingState) => set(() => ({ loading: loadingState })),

      // Action to set error state
      setError: (error) => set(() => ({ error })),

      // Function to fetch all users from Firebase Realtime Database
      fetchAllUsers: () => {
        const { setUsers, setLoading, setError } = get();

        setLoading(true);
        const usersRef = ref(database, 'users'); // Assuming all users are stored under 'users' node
		
        // Fetch users from Firebase
        const handleValue = (snapshot) => {
          const data = snapshot.val();
		  console.log({data})
          if (data) {
            const userList = Object.entries(data).map(([id, userData]) => ({
              id,
              ...userData,
            }));
            setUsers(userList); // Update Zustand state with the fetched data
          } else {
            setUsers([]); // If no data is found, set an empty array
          }
          setLoading(false); // Set loading to false after fetching data
        };
        const handleError = (error) => {
          setError(error.message);
          setLoading(false); // Set loading to false if there's an error
        };

        const unsubscribe = onValue(usersRef, handleValue, handleError);

        // Cleanup the listener on unmount
        return () => {
          off(usersRef, 'value', handleValue);
        };
      },
    }),
    {
      name: 'All-storage', // Name of the storage in localStorage
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);

export default AllUsers;
