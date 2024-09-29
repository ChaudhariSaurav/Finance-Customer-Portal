import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Container,
  Text,
  Link,
  VStack,
  InputGroup,
  InputLeftElement,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  useClipboard,
} from "@chakra-ui/react";
import { LuArrowLeft, LuMail, LuCopy } from "react-icons/lu";
import { handleForgotCustomerId } from "../service/auth";

const ForgotCustomer = () => {
  const [email, setEmail] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { hasCopied, onCopy } = useClipboard(customerId);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleCustomerIdRetrieval = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); 

    if (!email) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      const fetchedCustomerId = await handleForgotCustomerId(email);
      if (fetchedCustomerId) {
        setCustomerId(fetchedCustomerId);
        setError(""); // Clear errors
        setEmail(""); // Reset form after successful fetch
      } else {
        setError("Customer ID could not be retrieved. Please try again.");
      }
    } catch (error) {
      setError(error.message || "An error occurred. Please try again.");
      setCustomerId("");
	  setEmail("")
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Container maxW={{ base: "95%", sm: "md" }} centerContent>
        <Box
          p={8}
          mt={10}
          bg={bgColor}
          w="100%"
          borderRadius="lg"
          boxShadow="lg"
          borderWidth={1}
          borderColor={borderColor}
        >
          <VStack spacing={6}>
            <Heading size="xl" fontSize={{ base: "2xl", md: "4xl" }}>
              Forgot Customer ID
            </Heading>
            <Text
              textAlign="center"
              color="gray.600"
              fontSize={{ base: "sm", md: "md" }}
            >
              Enter the email address associated with your account to retrieve
              your customer ID.
            </Text>

            <form
              onSubmit={handleCustomerIdRetrieval}
              style={{ width: "100%" }}
            >
              <FormControl id="email">
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LuMail color="gray.300" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </InputGroup>
              </FormControl>
              <Button
                mt={6}
                colorScheme="teal"
                type="submit"
                width="full"
                isLoading={isLoading}
                loadingText="Retrieving"
              >
                Retrieve Customer ID
              </Button>
            </form>

            <Link
              href="/auth"
              color="teal.500"
              display="flex"
              alignItems="center"
              fontSize={{ base: "sm", md: "md" }}
            >
              <LuArrowLeft size={16} style={{ marginRight: "0.5rem" }} />
              Return to Sign In
            </Link>
          </VStack>
        </Box>

        {error ? (
          <Alert status="error" mt={4} width="100%">
            <AlertIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          customerId && (
            <Box
              p={4}
              bg="green.100"
              color="green.800"
              borderRadius="md"
              width="100%"
              textAlign="center"
              mt={4}
            >
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                Your Customer ID:
              </Text>
              <InputGroup size="md" mt={2}>
                <Input
                  value={customerId}
                  isReadOnly
                  bg="white"
                  _hover={{ cursor: "default" }}
                  color="green.800"
                />
                <Tooltip
                  label={hasCopied ? "Copied!" : "Copy to clipboard"}
                  closeOnClick={false}
                >
                  <IconButton
                    icon={<LuCopy />}
                    onClick={onCopy}
                    ml={2}
                    aria-label="Copy customer ID"
                  />
                </Tooltip>
              </InputGroup>
            </Box>
          )
        )}
      </Container>
    </>
  );
};

export default ForgotCustomer;
