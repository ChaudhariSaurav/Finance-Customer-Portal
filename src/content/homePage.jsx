import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Stack,
  Avatar,
  Divider,
  IconButton,
  useColorMode,
  useColorModeValue,
  HStack,
  VStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Link,
  Tooltip,
  ScaleFade,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import {
  LuMoon,
  LuSun,
  LuMenu,
  LuPhone,
  LuMail,
  LuMapPin,
  LuFacebook,
  LuTwitter,
  LuInstagram,
  LuLinkedin,
  LuIndianRupee,
  LuTrendingUp,
  LuBriefcase,
  LuUmbrella,
  LuArrowUp,
} from "react-icons/lu";

function HomePage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const cardBg = useColorModeValue("white", "gray.800");
  const gradientBg = useColorModeValue("gray.100", "#0f1016");
  const predefinedPassword = "JIYARANI04.02.2024"; 

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePasswordSubmit = () => {
    if (password === predefinedPassword) {
      window.location.href = "/auth"; // Redirect to your desired page
    } else {
      setError("Authentication Error: Incorrect Password");
      toast({
        title: "Authentication Error",
        description: "Incorrect Password. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setPassword("");
    }
  };

  const CustomHeading = ({ headingColor }) => (
    <Heading
      as="h2"
      size="3xl"
      mb={4}
      color={headingColor}
      sx={{
        textShadow: `
        5px 2px 2px rgba(0, 41, 0, 0.7), 
        5px 2px 4px rgba(0, 0, 0, 0.5), 
        5px 2px 4px rgba(0, 255, 0, 0.3)
      `,
      }}
    >
      Financial Solutions for Your Success
    </Heading>
  );

  const MenuItems = () => (
    <>
      <Button as={Link} href="#services" variant="ghost">
        Services
      </Button>
      <Button as={Link} href="#about" variant="ghost">
        About Us
      </Button>
      <Button as={Link} href="#founders" variant="ghost">
        Founders
      </Button>
      <Button as={Link} href="#cta" variant="ghost">
        Contact Us
      </Button>
    </>
  );

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Header Section */}
      <Box bg={useColorModeValue("white", "gray.900")} shadow="md" py={4} px={8} position="sticky" top={0} zIndex={10}>
        <Flex justify="space-between" align="center">
          <Heading as="h1" size="lg" color={headingColor}>
            AD Finance
          </Heading>
          <HStack spacing={4} display={{ base: "none", md: "flex" }}>
            <MenuItems />
            <IconButton
              icon={colorMode === "light" ? <LuMoon /> : <LuSun />}
              onClick={toggleColorMode}
              aria-label="Toggle Color Mode"
              variant="ghost"
            />
          </HStack>
          <IconButton
            icon={<LuMenu />}
            onClick={onOpen}
            aria-label="Open Menu"
            display={{ base: "flex", md: "none" }}
            variant="ghost"
          />
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      {/* <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <MenuItems />
              <Button onClick={toggleColorMode} leftIcon={colorMode === "light" ? <LuMoon /> : <LuSun />}>
                {colorMode === "light" ? "Dark Mode" : "Light Mode"}
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer> */}

      {/* Hero Section */}
      <Box textAlign="center" py={20} px={6} bgGradient={gradientBg}>
        <CustomHeading headingColor="purple.100" />

        <Text fontSize="xl" color={textColor} maxW="2xl" mx="auto">
          Empowering individuals and businesses with personalized financial strategies since 2024.
        </Text>
        <Button
          colorScheme="blue"
          mt={8}
          size="lg"
          shadow="md"
          onClick={onOpen} // Open the password modal
          _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
        >
          Get Started
        </Button>
      </Box>

      {/* About Section */}
      <Box bg={cardBg} shadow="md" py={16} px={8} mt={10} id="about">
        <Stack direction={["column", "row"]} spacing={10} align="center">
          <Box flex={1}>
            <Heading as="h3" size="xl" mb={4} color={headingColor}>
              About AD Finance
            </Heading>
            <Text fontSize="lg" color={textColor}>
              AD Finance, established in 2024, is a pioneering financial services firm committed to empowering individuals and businesses with comprehensive and personalized financial solutions. As a proud member of the JR Group, AD Finance embodies a rich legacy of trust, expertise, and client-centric values.
            </Text>
            <Text mt={4} fontSize="lg" color={textColor}>
              Whether you're planning for retirement, investing in your dream home, or expanding your business, our team of financial experts is here to guide you every step of the way.
            </Text>
          </Box>
          <Box flex={1}>
            <img src="https://ik.imagekit.io/laxmifinance/finance?updatedAt=1717276853546" alt="Financial planning" style={{ borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "100%", height: "auto" }} />
          </Box>
        </Stack>
      </Box>

      {/* Password Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter Password</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!error}
              />
              {error && <Text color="red.500">{error}</Text>}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handlePasswordSubmit}>
              Submit
            </Button>
            <Button onClick={onClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Services Section */}
      <Box py={16} px={8} textAlign="center" id="services" bgGradient={gradientBg}>
        <Heading as="h3" size="2xl" mb={12} color={headingColor}>
          Our Services
        </Heading>
        <Stack direction={["column", null, "row"]} spacing={8} justify="center">
          {[
            { title: "Wealth Management", icon: LuIndianRupee, description: "Tailored strategies to help you grow and manage your wealth." },
            { title: "Investment Advice", icon: LuTrendingUp, description: "Expert advice on investment opportunities that align with your goals." },
            { title: "Retirement Planning", icon: LuUmbrella, description: "Plan a secure and fulfilling retirement with confidence." },
            { title: "Business Financing", icon: LuBriefcase, description: "Flexible financing solutions to fuel your business growth." }
          ].map((service, index) => (
            <Box key={index} bg={cardBg} p={8} shadow="md" borderRadius="lg" flex={1} transition="all 0.3s" _hover={{ transform: "translateY(-5px)", shadow: "lg" }}>
              <service.icon size={40} style={{ margin: "0 auto 1rem" }} />
              <Heading as="h4" size="lg" mb={4}>
                {service.title}
              </Heading>
              <Text color={textColor}>
                {service.description}
              </Text>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Founders Section */}
      <Box py={16} px={8} bg={cardBg} shadow="md" mt={10} id="founders">
        <Heading as="h3" size="2xl" mb={12} textAlign="center" color={headingColor}>
          Meet the Founders
        </Heading>
        <Stack direction={["column", null, "row"]} spacing={12} justify="center">
          {[
            { name: "Abhishek Kumar", role: "Founder & Managing Director", bio: "Leading AD Finance with strategic foresight and operational expertise." },
            { name: "Keshav Kumar", role: "Founder & CEO", bio: "Championing innovation and client-centricity at AD Finance." }
          ].map((founder, index) => (
            <Box key={index} textAlign="center" maxW="sm">
              <Avatar name={founder.name} size="2xl" mb={6} src={`/placeholder.svg?text=${founder.name.charAt(0)}`} />
              <Heading as="h4" size="lg" mb={2}>
                {founder.name}
              </Heading>
              <Text fontSize="md" color={useColorModeValue("gray.500", "gray.400")} mb={4}>
                {founder.role}
              </Text>
              <Text color={textColor}>
                {founder.bio}
              </Text>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Call to Action */}
      <Box py={20} px={8} textAlign="center" mt={10} id="cta" bgGradient={gradientBg}>
        <Heading as="h3" size="2xl" color={headingColor} mb={6}>
          Ready to Secure Your Financial Future?
        </Heading>
        <Text fontSize="xl" color={textColor} maxW="2xl" mx="auto" mb={8}>
          Discover how AD Finance can transform your financial aspirations into reality. Contact us today!
        </Text>
        <Button
          colorScheme="blue"
          size="lg"
          shadow="md"
          _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
          leftIcon={<LuPhone />}
        >
          Contact Us
        </Button>
      </Box>

      {/* Footer Section */}
      <Box bg={useColorModeValue("gray.100", "gray.800")} py={12} px={8}>
        <Stack direction={["column", "row"]} spacing={8} justify="space-between">
          <VStack align="start" spacing={4}>
            <Heading as="h4" size="md" color={headingColor}>
              AD Finance
            </Heading>
            <Text color={textColor}>Empowering your financial journey since 2024.</Text>
          </VStack>
          <VStack align="start" spacing={4}>
            <Heading as="h4" size="md" color={headingColor}>
              Contact
            </Heading>
            <HStack>
              <LuPhone />
              <Text color={textColor}>+91 2212345678</Text>
            </HStack>
            <HStack>
              <LuMail />
              <Link href="mailto:adfinancejr@gmail.com" color={textColor}>
                adfinancejr@gmail.com
              </Link>
            </HStack>
            <HStack>
              <LuMapPin />
              <Text color={textColor}> Gospur, Dalsinghsarai, near Ranjan ITI, Bihar</Text>
            </HStack>
          </VStack>
          <VStack align="start" spacing={4}>
            <Heading as="h4" size="md" color={headingColor}>
              Follow Us
            </Heading>
            <HStack spacing={4}>
              <IconButton as="a" href="#" icon={<LuFacebook />} aria-label="Facebook" variant="ghost" />
              <IconButton as="a" href="#" icon={<LuTwitter />} aria-label="Twitter" variant="ghost" />
              <IconButton as="a" href="#" icon={<LuInstagram />} aria-label="Instagram" variant="ghost" />
              <IconButton as="a" href="#" icon={<LuLinkedin />} aria-label="LinkedIn" variant="ghost" />
            </HStack>
          </VStack>
        </Stack>
        <Divider my={8} />
        <Text color={textColor} fontSize="sm" textAlign="center">
          &copy; {new Date().getFullYear()} AD Finance. All rights reserved.
        </Text>
      </Box>

      {/* Scroll to Top Button */}
      <ScaleFade in={scrollPosition > 100}>
        <Tooltip label="Scroll to top" placement="left">
          <IconButton
            aria-label="Scroll to top"
            icon={<LuArrowUp />}
            size="lg"
            colorScheme="blue"
            variant="solid"
            position="fixed"
            bottom="20px"
            right="20px"
            onClick={scrollToTop}
            zIndex={20}
          />
        </Tooltip>
      </ScaleFade>
    </Box>
  );
}

export default HomePage;
