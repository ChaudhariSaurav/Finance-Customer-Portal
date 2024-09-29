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
  Select,
  SimpleGrid,
  Spinner,
  Progress,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { handleUploadFiles } from "../service/auth";
import useDataStore from "../zustand/userDataStore";
import AppLayout from "../layout/AppShell";
import { MdDelete } from "react-icons/md"; // Import trash icon

const GuarantorUpload = () => {
  const [guarantorDetails, setGuarantorDetails] = useState({
    adharNumber: "",
    panCardNumber: "",
    name: "",
    relationship: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const toast = useToast();
  const { user } = useDataStore();

  const handleGuarantorChange = (e) => {
    setGuarantorDetails({ ...guarantorDetails, [e.target.name]: e.target.value });
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
    const { adharNumber, panCardNumber, name, relationship } = guarantorDetails;
    if (!adharNumber || !panCardNumber || !name || !relationship) {
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
      await handleUploadFiles(files, user, 'guarantor', guarantorDetails, handleUploadProgress);
      toast({
        title: "Upload successful",
        description: "Guarantor documents and details have been successfully uploaded.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFiles([]);
      setGuarantorDetails({ adharNumber: "", panCardNumber: "", name: "", relationship: "" });
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

  const removeFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const isUploadButtonEnabled = () => {
    return files.length > 0 && !loading;
  };

  const uploadButtonText = loading ? "Please wait..." : "Upload Guarantor Documents";

  return (
    <AppLayout>
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Flex align="center">
            <Heading size="lg">Guarantor Document Upload</Heading>
            {loading && (
              <Text ml={4} fontSize="lg" fontWeight="medium">
                Documents uploading, please wait...
              </Text>
            )}
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl isRequired>
              <FormLabel>Guarantor Name</FormLabel>
              <Input
                name="name"
                value={guarantorDetails.name}
                onChange={handleGuarantorChange}
                placeholder="Enter Guarantor Name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Aadhar Number</FormLabel>
              <Input
                name="adharNumber"
                value={guarantorDetails.adharNumber}
                onChange={handleGuarantorChange}
                placeholder="123456789012"
                maxLength={12}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>PAN Card Number</FormLabel>
              <Input
                name="panCardNumber"
                value={guarantorDetails.panCardNumber}
                onChange={handleGuarantorChange}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Relationship</FormLabel>
              <Select
                name="relationship"
                value={guarantorDetails.relationship}
                onChange={handleGuarantorChange}
                placeholder="Select Relationship"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Spouse">Spouse</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </Select>
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
                  <Flex alignItems="center">
                    {uploadProgress[file.name] !== undefined ? (
                      <Progress value={uploadProgress[file.name]} colorScheme="teal" size="sm" width="200px" />
                    ) : null}
                    <IconButton
                      aria-label="Remove file"
                      icon={<MdDelete />}
                      onClick={() => removeFile(file.name)}
                      colorScheme="red"
                      size="sm"
                      ml={2}
                    />
                  </Flex>
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

          {loading && (
            <VStack spacing={4}>
              <Spinner size="xl" color="teal.500" thickness="4px" />
              <Text fontSize="lg" fontWeight="medium">Processing, please wait...</Text>
            </VStack>
          )}
        </VStack>
      </Container>
    </AppLayout>
  );
};

export default GuarantorUpload;
