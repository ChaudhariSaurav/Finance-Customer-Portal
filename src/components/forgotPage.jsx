import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  useToast,
  Container,
  Text,
  Link,
  VStack,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from "@chakra-ui/react";
import { LuAlertCircle, LuArrowLeft, LuMail } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { handleForgotPassword } from "../service/auth";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        icon: <LuAlertCircle />,
      });
      setIsLoading(false);
      return;
    }

    try {
      const message = await handleForgotPassword(email);
      setEmailMessage(message);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for the password reset link.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setTimeout(() => {
        navigate("/signin");
      }, 5000);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setEmailMessage("");
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        icon: <LuAlertCircle />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" centerContent>
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
          <Heading size="xl">Forgot Password</Heading>
          <Text textAlign="center" color="gray.600">
            Enter the email address associated with your account to reset your password.
          </Text>
          {emailMessage && (
            <Text
              p={3}
              bg="green.100"
              color="green.800"
              borderRadius="md"
              width="100%"
              textAlign="center"
            >
              {emailMessage}
            </Text>
          )}
          <form onSubmit={handlePasswordReset} style={{ width: '100%' }}>
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
              loadingText="Sending"
            >
              Send Password Reset Email
            </Button>
          </form>
          <Link
            href="/signin"
            color="teal.500"
            display="flex"
            alignItems="center"
            fontSize="sm"
          >
            <LuArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
            Return to Sign In
          </Link>
        </VStack>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
