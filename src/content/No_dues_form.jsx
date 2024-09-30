import React, { useState } from "react";
import { database } from "../config/firebase";
import { ref, set } from "firebase/database";
import { Container, Input, Button, VStack, useToast } from "@chakra-ui/react";
import AppLayout from "../layout/AppShell";

const NoDueForm = () => {
  const [name, setName] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!name || !accountNo || !ifscCode || !remarks) {
      toast({
        title: "Error",
        description: "All fields are required.",
        status: "error",
      });
      return;
    }

    setLoading(true);
    const applicationRef = ref(database, `noDueApplications/${accountNo}_${ifscCode}`);
    try {
      await set(applicationRef, {
        name,
        accountNo,
        ifscCode,
        remarks,
        submittedAt: new Date().toISOString(),
      });
      toast({
        title: "Success",
        description: "No-due application submitted successfully.",
        status: "success",
      });
      // Reset form
      setName("");
      setAccountNo("");
      setIfscCode("");
      setRemarks("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit the application.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
  <AppLayout>
	  <Container>
      <VStack spacing={4} align="start">
        <Input
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <Input
          placeholder="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
          Submit No-Due Application
        </Button>
      </VStack>
    </Container>
  </AppLayout>
  );
};

export default NoDueForm;
