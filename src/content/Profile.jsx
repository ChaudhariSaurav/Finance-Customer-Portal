import React, { useEffect, useState } from 'react';
import { Box, Text, Avatar, Stack, Heading, Input, Spinner, Flex, IconButton, Button, useToast } from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import AppLayout from '../layout/AppShell';
import { database, storage } from "../config/firebase";
import { ref, onValue, update } from "firebase/database";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import useDataStore from '../zustand/userDataStore';
import { addNotification } from '../service/auth';
import axios from 'axios';

function Profile() {
  const { user } = useDataStore();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const toast = useToast();

  useEffect(() => {
    const userId = user.uid;
    const userRef = ref(database, `users/${userId}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const getLocationName = async (latitude, longitude) => {
    const apiKey = 'AIzaSyCKSO7o6mQkhcKlzSRMmQSzHMm8yNzPZEM'; // Replace with your API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    
    try {
      const response = await axios.get(url);
      if (response.data.status === "OK" && response.data.results.length > 0) {
        return response.data.results[0].formatted_address; // Get the formatted address
      } else {
        throw new Error("Location not found");
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      return "Location not available";
    }
  };

  useEffect(() => {
    const fetchLocationName = async () => {
      if (userData?.latitude && userData?.longitude) {
        const locationName = await getLocationName(userData.latitude, userData.longitude);
        setUserData((prevData) => ({ ...prevData, locationName })); // Store location name in state
      }
    };

    fetchLocationName();
  }, [userData?.latitude, userData?.longitude]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);

      const storagePath = `userAvatars/${user.uid}/${file.name}`;
      const imageRef = storageRef(storage, storagePath);

      try {
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);

        const userRef = ref(database, `users/${user.uid}`);
        await update(userRef, { photoURL: url });

        setUserData((prevData) => ({ ...prevData, photoURL: url }));
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleEmailChangeRequest = async () => {
    if (!newEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a new email address.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const userRef = ref(database, `users/${user.uid}`);
      
      await update(userRef, { email: newEmail });
      await addNotification(user.uid, "Email Changed", "Your email address has been successfully changed.");
      toast({
        title: "Email Change Request",
        description: "Your email change request has been submitted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setNewEmail('');
    } catch (error) {
      console.error("Error updating email:", error);
      toast({
        title: "Error",
        description: "There was an error updating your email.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <AppLayout>
      {(loading || uploading) && (
        <Flex justify="center" align="center" height="100vh">
          <Spinner size="xl" />
          <Text ml={4}>{loading ? "Loading... Please wait" : "Uploading... Please wait"}</Text>
        </Flex>
      )}
      {!loading && !uploading && (
        <Box padding={4} minHeight="80vh" zIndex={100 }>
          <Stack spacing={4}>
            <Heading as="h2">Profile Information</Heading>
            <Flex align="center">
              <Avatar size="xl" src={userData.photoURL || `https://avatars.dicebear.com/api/male/username.svg`} />
              <IconButton
                aria-label="Upload Image"
                icon={<FiUpload />}
                onClick={() => document.getElementById('file-input').click()}
                ml={4}
              />
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </Flex>
            <Input value={userData.firstName} placeholder="First Name" isReadOnly />
            <Input value={userData.lastName} placeholder="Last Name" isReadOnly />
            <Input value={userData.email} placeholder="Email" isReadOnly />
            <Input value={userData.mobile} placeholder="Mobile" isReadOnly />
            <Input value={userData.dateOfBirth} placeholder="Date of Birth" isReadOnly />
            <Input value={userData?.documents?.customer?.adharNumber} placeholder="Aadhaar Number" isReadOnly />
            <Input value={userData?.documents?.customer?.panCardNumber} placeholder="PAN Card Number" isReadOnly />
            <Input value={`₹${userData.totalAmountPaid || "0"}`} placeholder="Total EMI Amount Paid" isReadOnly />
            <Input value={userData.totalEmiMonths} placeholder="Total Installments" isReadOnly />
            <Input value={userData.locationName || "Fetching location..."} placeholder="Location" isReadOnly />
            <Stack spacing={2}>
              <Heading as="h4" size="md">Request Email Change</Heading>
              <Input
                value={newEmail}
                placeholder="New Email Address"
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Button onClick={handleEmailChangeRequest} colorScheme="blue">Submit Request</Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </AppLayout>
  );
}

export default Profile;
