import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Image,
  Spinner,
  useToast,
  Badge,
  Divider,
  HStack,
  IconButton,
  Tooltip,
  AbsoluteCenter,
  useColorMode,
} from "@chakra-ui/react";
import { ref, get, set } from "firebase/database";
import { database } from "../config/firebase";
import useDataStore from "../zustand/userDataStore";
import AppLayout from "../layout/AppShell";
import { LuFileText, LuDownload, LuImage, LuTrash } from "react-icons/lu";
import { images } from "../stores/images";

const FinalUploadedPage = () => {
  const [customerDocs, setCustomerDocs] = useState(null);
  const [guarantorDocs, setGuarantorDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useDataStore();
  const toast = useToast();
  const { colorMode } = useColorMode();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const customerRef = ref(database, `users/${user.uid}/documents/customer`);
        const guarantorRef = ref(database, `users/${user.uid}/documents/guarantor`);

        const [customerSnapshot, guarantorSnapshot] = await Promise.all([
          get(customerRef),
          get(guarantorRef),
        ]);

        if (customerSnapshot.exists()) {
          setCustomerDocs(customerSnapshot.val());
        }

        if (guarantorSnapshot.exists()) {
          setGuarantorDocs(guarantorSnapshot.val());
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: "Failed to fetch uploaded documents. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user, toast]);

  const handleDownload = (url, fileName) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
        toast({
          title: "Download Error",
          description: "Failed to download the file. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleRemoveDocument = async (type, index) => {
    const documentRef = ref(database, `users/${user.uid}/documents/${type}`);
    const fileUrls = type === "customer" ? customerDocs.fileUrls : guarantorDocs.fileUrls;

    try {
      const updatedFileUrls = fileUrls.filter((_, i) => i !== index);
      await set(documentRef, { fileUrls: updatedFileUrls });

      if (type === "customer") {
        setCustomerDocs((prev) => ({ ...prev, fileUrls: updatedFileUrls }));
      } else {
        setGuarantorDocs((prev) => ({ ...prev, fileUrls: updatedFileUrls }));
      }

      toast({
        title: "Document Removed",
        description: "The document has been removed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error removing document:", error);
      toast({
        title: "Remove Error",
        description: "Failed to remove the document. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderDocuments = (docs, title, type) => {
    if (!docs) return null;

    return (
      <Box>
        <Heading size="md" mb={4}>
          {title}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {docs.fileUrls.map((url, index) => (
            <Box
              key={index}
              borderWidth={1}
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              _hover={{ boxShadow: "xl", transition: "0.2s" }}
            >
              <Box p={4}>
                <HStack justifyContent="space-between">
                  <Badge colorScheme={url.toLowerCase().endsWith(".pdf") ? "red" : "green"}>
                    {url.toLowerCase().endsWith(".pdf") ? "PDF" : "Image"}
                  </Badge>
                  <HStack>
                    <Tooltip
                      label={
                        url.toLowerCase().endsWith(".pdf")
                          ? "Download PDF"
                          : "View Image"
                      }
                    >
                      <IconButton
                        icon={
                          url.toLowerCase().endsWith(".pdf") ? (
                            <LuDownload />
                          ) : (
                            <LuImage />
                          )
                        }
                        onClick={() =>
                          url.toLowerCase().endsWith(".pdf")
                            ? handleDownload(url, `document_${index + 1}.pdf`)
                            : window.open(url, "_blank")
                        }
                        aria-label={
                          url.toLowerCase().endsWith(".pdf")
                            ? "Download PDF"
                            : "View Image"
                        }
                        size="sm"
                      />
                    </Tooltip>
                    <Tooltip label="Remove Document">
                      <IconButton
                        icon={<LuTrash />}
                        onClick={() => handleRemoveDocument(type, index)}
                        aria-label="Remove Document"
                        colorScheme="red"
                        size="sm"
                      />
                    </Tooltip>
                  </HStack>
                </HStack>
              </Box>
              {url.toLowerCase().endsWith(".pdf") ? (
                <Box p={4} textAlign="center" bg={colorMode === "dark" ? "gray.800" : "gray.100"}>
                  <LuFileText size={48} />
                  <Text mt={2}>Document {index + 1}</Text>
                </Box>
              ) : (
                <Image
                  src={url}
                  alt={`Uploaded document ${index + 1}`}
                  objectFit={{ base: "contain", md: "cover" }}
                  height={{ base: "auto", md: "200px" }}
                  width="100%"
                  maxHeight={{ base: "300px", md: "200px" }} // Responsive height
                />
              )}
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    );
  };

  const renderDetails = (details, title) => {
    if (!details) return null;

    return (
      <Box p={4} borderRadius="md" boxShadow="sm" bg={colorMode === "dark" ? "gray.800" : "gray.200"}>
        <Heading size="md" mb={2}>
          {title}
        </Heading>
        <VStack align="stretch" spacing={2}>
          {Object.entries(details).map(
            ([key, value]) =>
              key !== "fileUrls" && (
                <HStack key={key} justifyContent="space-between">
                  <Text fontWeight="bold">{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                  <Text>{value}</Text>
                </HStack>
              )
          )}
        </VStack>
      </Box>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <VStack spacing={2}>
            <Spinner size="xl" />
            <Text>Please wait....</Text>
          </VStack>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg" textAlign="center">
            Uploaded Documents
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            {renderDetails(customerDocs, "Customer Details")}
            {renderDetails(guarantorDocs, "Guarantor Details")}
          </SimpleGrid>

          <Box position="relative" padding="10">
            <Divider />
            <AbsoluteCenter bg={colorMode === "dark" ? "gray.800" : "white"} px="4">
              <Badge>Customer Document</Badge>
            </AbsoluteCenter>
          </Box>

          {renderDocuments(customerDocs, "Customer Documents", "customer")}

          <Box position="relative" padding="10">
            <Divider />
            <AbsoluteCenter bg={colorMode === "dark" ? "gray.800" : "white"} px="4">
              <Badge>Guarantor Document</Badge>
            </AbsoluteCenter>
          </Box>

          {renderDocuments(guarantorDocs, "Guarantor Documents", "guarantor")}

          {!customerDocs && !guarantorDocs && (
            <Box
              textAlign="center"
              p={8}
              bg={colorMode === "dark" ? "gray.700" : "gray.200"}
              borderRadius="md"
              transition="all 0.3s"
              _hover={{
                shadow: "md",
                borderColor: "gray.900",
              }}
            >
              {images.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Image ${index + 1}`}
                  mb={4}
                  mx={"auto"}
                  maxW={"auto"}
                  objectFit={"contain"}
                />
              ))}
              <Text fontSize="xl" color={colorMode === "dark" ? "white" : "gray.800"}>
                No documents have been uploaded yet.
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    </AppLayout>
  );
};

export default FinalUploadedPage;
