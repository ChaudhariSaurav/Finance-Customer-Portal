import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableMonths, registerUser } from "../service/auth";
import { useDropzone } from "react-dropzone";
import { FiEye, FiEyeOff, FiUpload } from "react-icons/fi";
import { LuArrowLeft } from "react-icons/lu";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Text,
  Grid,
  GridItem,
  Progress,
  InputGroup,
  InputRightElement,
  IconButton,
  Tooltip,
  VStack,
  Heading,
  useColorModeValue,
  Link,
  HStack,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [availableEmiMonths, setAvailableEmiMonths] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    mobile: "",
    photo: null,
    loanType: "E",
    totalEmiMonths: "12",
    loanValue: "10000",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);

  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const months = getAvailableMonths(formData.loanValue);
    setAvailableEmiMonths(months);
    if (!months.includes(parseInt(formData.totalEmiMonths))) {
      setFormData((prev) => ({ ...prev, totalEmiMonths: months[0] || "12" }));
    }
  }, [formData.loanValue]);

  useEffect(() => {
    const filledFields = Object.values(formData).filter(Boolean).length;
    setProgress((filledFields / Object.keys(formData).length) * 100);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "loanType") {
      const updatedLoanValue =
        value === "E"
          ? "10000"
          : value === "J"
          ? "20000"
          : value === "O"
          ? "30000"
          : value === "T"
          ? "40000"
          : value === "Y"
          ? "50000"
          : "";
      setFormData((prev) => ({
        ...prev,
        loanType: value,
        loanValue: updatedLoanValue,
      }));
      const months = getAvailableMonths(updatedLoanValue);
      setAvailableEmiMonths(months);
      if (!months.includes(parseInt(formData.totalEmiMonths))) {
        setFormData((prev) => ({ ...prev, totalEmiMonths: months[0] || "12" }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const onDrop = (acceptedFiles) => {
    setFormData((prev) => ({
      ...prev,
      photo: acceptedFiles[0],
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const monthDiff = new Date().getMonth() - birthDate.getMonth();
    return monthDiff < 0 ||
      (monthDiff === 0 && new Date().getDate() < birthDate.getDate())
      ? age - 1
      : age;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one special character";
    }
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.gender) newErrors.gender = "Gender selection is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    else if (calculateAge(formData.dateOfBirth) < 18)
      newErrors.dateOfBirth = "You must be at least 18 years old";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = "Invalid mobile number";
    if (!formData.photo) newErrors.photo = "Profile photo is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await registerUser(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.dateOfBirth,
        formData.mobile,
        formData.photo,
        formData.loanType,
        formData.totalEmiMonths,
        formData.loanValue,
        formData.gender
      );

      toast({
        title: "Registration Successful",
        description: `Thank you for applying for a loan, ${response.user.name}. - Customer ID: ${response.customerId}`,
        status: "success",
        duration: 10000,
        isClosable: true,
      });

      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxW="4xl"
      mx="auto"
      mt={8}
      p={6}
      borderWidth={1}
      borderRadius="xl"
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="lg"
    >
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" mb={4}>
          LOAN APPLICATION FORM 
        </Heading>
        <Progress value={progress} size="sm" colorScheme="teal" mb={4} />
        {loading ? (
          <VStack spacing={4}>
            {/* <Spinner size="xl" color="teal.500" thickness="4px" /> */}
          <svg viewBox="0 0 1320 300">
            <text x="50%" y="50%" dy=".35em" textAnchor="middle">
            Processing your loan application.......
            </text>
          </svg>	
          </VStack>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={6}
            >
              <GridItem>
                <FormControl isInvalid={errors.firstName}>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                  />
                  <Text color="red.500" fontSize="sm">
                    {errors.firstName}
                  </Text>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isInvalid={errors.lastName}>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                  />
                  <Text color="red.500" fontSize="sm">
                    {errors.lastName}
                  </Text>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isInvalid={errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                  <Text color="red.500" fontSize="sm">
                    {errors.email}
                  </Text>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isInvalid={errors.dateOfBirth}>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                  <Text color="red.500" fontSize="sm">
                    {errors.dateOfBirth}
                  </Text>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isInvalid={errors.mobile}>
                  <FormLabel>Mobile</FormLabel>
                  <Input
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter your mobile number"
                  />
                  <Text color="red.500" fontSize="sm">
                    {errors.mobile}
                  </Text>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={errors.gender}>
                  <FormLabel>Gender</FormLabel>
                  <RadioGroup
                    name="gender"
                    value={formData.gender}
                    onChange={(value) =>
                      handleChange({ target: { name: "gender", value } })
                    }
                  >
                    <HStack spacing={4}>
                      <Radio value="male">Male</Radio>
                      <Radio value="female">Female</Radio>
                      <Radio value="other">Other</Radio>
                    </HStack>
                  </RadioGroup>
                  <Text color="red.500" fontSize="sm">
                    {errors.gender}
                  </Text>
                </FormControl>
              </GridItem>

              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl isInvalid={errors.photo}>
                  <FormLabel>Profile Photo</FormLabel>
                  <Tooltip
                    label="Click or drag to upload"
                    hasArrow
                    placement="top"
                  >
                    <Box
                      {...getRootProps()}
                      p={4}
                      borderRadius="md"
                      borderStyle="dashed"
                      borderWidth={2}
                      borderColor={isDragActive ? "teal.500" : "gray.300"}
                      bg={isDragActive ? "teal.50" : "transparent"}
                      textAlign="center"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ borderColor: "teal.500" }}
                    >
                      <input {...getInputProps()} />
                      <VStack spacing={2}>
                        <FiUpload size={24} color="teal" />
                        <Text>
                          {formData.photo
                            ? formData.photo.name
                            : "Drag & drop your photo here, or click to select"}
                        </Text>
                      </VStack>
                    </Box>
                  </Tooltip>
                  <Text color="red.500" fontSize="sm">
                    {errors.photo}
                  </Text>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Loan Amount</FormLabel>
                  <Select
                    name="loanType"
                    value={formData.loanType}
                    onChange={handleChange}
                  >
                    <option value="E">E - Rs 10,000</option>
                    <option value="J">J - Rs 20,000</option>
                    <option value="O">O - Rs 30,000</option>
                    <option value="T">T - Rs 40,000</option>
                    <option value="Y">Y - Rs 50,000</option>
                  </Select>
                </FormControl>
              </GridItem>

              
              <GridItem>
                <FormControl>
                  <FormLabel>Total EMI Months</FormLabel>
                  <Select
                    name="totalEmiMonths"
                    value={formData.totalEmiMonths}
                    onChange={handleChange}
                  >
                    {availableEmiMonths.map((month) => (
                      <option key={month} value={month}>
                        {month} Months
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isReadOnly>
                  <FormLabel>Loan Amount Reference</FormLabel>
                  <Input
                    name="loanValue"
                    value={`Applied for -Rs ${formData.loanValue}`}
                    readOnly
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isInvalid={errors.password}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ background: "transparent" }}
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <Text color="red.500" fontSize="sm">
                    {errors.password}
                  </Text>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isInvalid={errors.confirmPassword}>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        variant="ghost"
                        style={{ background: "transparent" }}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <Text color="red.500" fontSize="sm">
                    {errors.confirmPassword}
                  </Text>
                </FormControl>
              </GridItem>

            </Grid>
            <Button
              colorScheme="teal"
              type="submit"
              mt={8}
              size="lg"
              width="full"
            >
              Register
            </Button>
          </form>
        )}

        <Link
          href="/auth"
          color="teal.500"
          display="flex"
          alignItems="center"
          fontSize="sm"
        >
          <LuArrowLeft size={16} style={{ marginRight: "0.5rem" }} />
          Return to Sign In
        </Link>
      </VStack>
    </Box>
  );
};

export default RegistrationForm;
