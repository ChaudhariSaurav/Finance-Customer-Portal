import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Spinner,
  Center,
  Text,
  Heading,
  Link,
  Flex,
  VStack,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiLock, FiUser } from 'react-icons/fi';
import { LuAlertCircle } from 'react-icons/lu';
import { userLoginByEmail, userLoginByCustomerID } from '../service/auth'; // Adjust import paths accordingly
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router

const SignInForm = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier) {
      newErrors.identifier = "Customer ID or Email is required.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { identifier, password } = formData;

      if (identifier.includes('@')) {
        const user = await userLoginByEmail(identifier, password);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.displayName || user.email}!`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        const user = await userLoginByCustomerID(identifier, password);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.displayName || user.email}!`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login.",
        status: "error",
        duration: 5000,
        isClosable: true,
        icon: <LuAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      <Box
        maxW="md"
        w="full"
        bg={bgColor}
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        borderColor={borderColor}
      >
        <VStack spacing={6} align="stretch">
          <Heading as="h3" size="md" textAlign="center">
            Sign in to your Ad finacne account
          </Heading>
          <Text textAlign="center" as='mark' color="gray.600" borderWidth={2} borderRadius={5} p={2}  colorScheme='red'>
          Ensuring your financial future with Ad Finance
          </Text>
          {loading ? (
            <Center>
              <Spinner size="xl" />
            </Center>
          ) : (
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.identifier}>
                  <FormLabel>Email or Customer ID</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiUser color="gray.300" />
                    </InputLeftElement>
                    <Input
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleChange}
                      placeholder="Enter your Customer ID or Email"
                    />
                  </InputGroup>
                  {errors.identifier && <Text color="red.500" fontSize="sm">{errors.identifier}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <Flex justify="space-between" mb={2}>
                    <Link color="teal.500" href="/forgot-password" fontSize="sm">
                      Forgot Password?
                    </Link>
                    <Link color="teal.500" href="/forgot-customerId" fontSize="sm">
                      Forgot Customer ID?
                    </Link>
                  </Flex>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                  
                    <InputLeftElement pointerEvents="none">
                      <FiLock color="gray.300" />
                    </InputLeftElement>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                  </InputGroup>
                  {errors.password && <Text color="red.500" fontSize="sm">{errors.password}</Text>}
                </FormControl>

                <Button
                  colorScheme="teal"
                  type="submit"
                  width="full"
                  isLoading={loading}
                  loadingText="Signing In"
                >
                  Sign In
                </Button>

                <Flex justify="center">
                  <Text>Don't have an account?</Text>
                  <Link href="/register" color="teal.500" ml={2}>
                    Register here
                  </Link>
                </Flex>
              </VStack>
            </form>
          )}
        </VStack>
      </Box>
    </Center>
  );
};

export default SignInForm;
