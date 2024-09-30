import React, { useState } from "react";
import {
  Container,
  Input,
  Button,
  VStack,
  Text,
  Spinner,
  useToast,
  Box,
} from "@chakra-ui/react";
import { database } from "../config/firebase"; // Firebase configuration
import { ref, set } from "firebase/database";
import AppLayout from "../layout/AppShell";

const Passbook = () => {
  const [accountNo, setAccountNo] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [bankData, setBankData] = useState(null);
  const toast = useToast();

  // Fetch IFSC Details from API
  const fetchIfscDetails = async () => {
    if (!ifscCode) {
      toast({
        title: "Error",
        description: "Please enter IFSC code.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://bank-apis.justinclicks.com/API/V1/IFSC/${ifscCode}/`
      );
      const data = await response.json();
      if (data && data.BANK && data.IFSC) {
        setBankData(data);
      } else {
        toast({
          title: "No Data Found",
          description: "No data available for this IFSC code.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        setBankData(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Save the passbook details to Firebase Realtime Database
  const saveToDatabase = async () => {
    if (!accountNo || !ifscCode || !bankData) {
      toast({
        title: "Error",
        description: "Please complete the account number and IFSC details.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const passbookRef = ref(database, `accounts/${accountNo}_${ifscCode}`);
      await set(passbookRef, {
        accountNo: accountNo,
        ifscCode: bankData.IFSC,
        bankName: bankData.BANK,
        branch: bankData.BRANCH,
        address: bankData.ADDRESS,
        city: bankData.CITY,
        state: bankData.STATE,
      });

      toast({
        title: "Success",
        description: "Passbook details saved successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form after saving
      setAccountNo("");
      setIfscCode("");
      setBankData(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save data to database.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <AppLayout>
      <Container>
        <VStack spacing={4} align="start">
          {/* Input fields */}
          <Input
            placeholder="Enter Account Number"
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
          />
          <Input
            placeholder="Enter IFSC Code"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value)}
          />
          <Button colorScheme="blue" onClick={fetchIfscDetails} isLoading={loading}>
            Fetch Bank Details
          </Button>
        </VStack>

        {loading && <Spinner />}

        {/* Display fetched Bank Data */}
        {bankData && (
          <Box mt={6}>
            <Text fontWeight="bold">Bank Name: {bankData.BANK}</Text>
            <Text>Branch: {bankData.BRANCH}</Text>
            <Text>Address: {bankData.ADDRESS}</Text>
            <Text>City: {bankData.CITY}</Text>
            <Text>State: {bankData.STATE}</Text>
          </Box>
        )}

        {/* Button to save passbook data */}
        <Button
          colorScheme="green"
          onClick={saveToDatabase}
          isDisabled={!bankData || !accountNo || loading}
          mt={4}
        >
          Save to Database
        </Button>
      </Container>
    </AppLayout>
  );
};

export default Passbook;
