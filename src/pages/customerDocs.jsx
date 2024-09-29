import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
  Text,
  SimpleGrid,
  Spinner,
  Progress,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { handleUploadFiles } from "../service/auth";
import useDataStore from "../zustand/userDataStore";
import AppLayout from "../layout/AppShell";
import { BsFiletypePdf } from "react-icons/bs";
import { AiOutlineFileImage } from 'react-icons/ai';

const CustomerUpload = () => {
  const [customerDetails, setCustomerDetails] = useState({
    adharNumber: "",
    panCardNumber: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const toast = useToast();
  const { user } = useDataStore();

  const handleCustomerChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
  });

  const validateInputs = () => {
    const { adharNumber, panCardNumber } = customerDetails;
    if (!adharNumber || !panCardNumber) {
      toast({
        title: "Missing information",
        description: "Please fill in all the required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    if (!/^\d{12}$/.test(adharNumber)) {
      toast({
        title: "Invalid Aadhar Number",
        description: "Aadhar Number should be 12 digits",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCardNumber)) {
      toast({
        title: "Invalid PAN Card Number",
        description: "PAN Card Number should be in the format ABCDE1234F",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const handleUploadProgress = (fileName, progress) => {
    setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await handleUploadFiles(files, user, 'customer', customerDetails, handleUploadProgress);
      toast({
        title: "Upload successful",
        description: "Your documents and details have been successfully uploaded.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFiles([]);
      setCustomerDetails({ adharNumber: "", panCardNumber: "" });
      setUploadProgress({});
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "An unknown error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const isUploadButtonEnabled = () => {
    return files.length > 0 && !loading;
  };

  const uploadButtonText = loading ? "Please wait..." : "Ready to upload";

  return (
    <AppLayout>
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg">Customer Document Upload</Heading>
          {loading && (
            <VStack spacing={4}>
              <Spinner size="xl" color="teal.500" thickness="4px" />
              <Text fontSize="lg" fontWeight="medium">
                Uploading documents, please wait...
              </Text>
            </VStack>
          )}
          {!loading && (
            <>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Aadhar Number</FormLabel>
                  <Input
                    name="adharNumber"
                    value={customerDetails.adharNumber}
                    onChange={handleCustomerChange}
                    placeholder="123456789012"
                    maxLength={12}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>PAN Card Number</FormLabel>
                  <Input
                    name="panCardNumber"
                    value={customerDetails.panCardNumber}
                    onChange={handleCustomerChange}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </FormControl>
              </SimpleGrid>
              <Box
                {...getRootProps()}
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                p={4}
                textAlign="center"
                cursor="pointer"
              >
                <input {...getInputProps()} />
                <Text>Drag and drop files here, or click to select files</Text>
              </Box>
              {files.length > 0 && (
                <VStack align="stretch">
                  <Text fontWeight="bold">Selected Files:</Text>
                  {files.map((file) => (
                    <Box key={file.name} display="flex" alignItems="center" justifyContent="space-between">
                      <Text>{file.name}</Text>
                      <Text>
                        {uploadProgress[file.name] !== undefined ? (
                          <Progress value={uploadProgress[file.name]} colorScheme="teal" size="sm" width="200px" />
                        ) : (
                          file.type === 'application/pdf' ? <BsFiletypePdf/> : <AiOutlineFileImage />
                        )}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              )}
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={loading}
                disabled={!isUploadButtonEnabled()}
              >
                {uploadButtonText}
              </Button>
            </>
          )}
        </VStack>
      </Container>
    </AppLayout>
  );
};

export default CustomerUpload;
