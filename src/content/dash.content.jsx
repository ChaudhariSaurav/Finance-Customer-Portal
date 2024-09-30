import React, { useEffect, useState } from "react";
import AppLayout from "../layout/AppShell";
import useDataStore from "../zustand/userDataStore";
import { database } from "../config/firebase";
import { ref, onValue } from "firebase/database";
import {
  Container,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  VStack,
  Spinner,
  Progress,
  useToast,
  Flex,
  Box,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { LuXCircle, LuCheck } from "react-icons/lu";

const DashContent = () => {
  const [userData, setUserData] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerVisible, setBannerVisible] = useState(true);
  const toast = useToast();
  const { user } = useDataStore();
  const [greeting, setGreeting] = useState("");
  const { colorMode } = useColorMode();

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning!");
    } else if (currentHour < 14) {
      setGreeting("Good Afternoon!");
    } else if (currentHour < 18) {
      setGreeting("Good Evening!");
    } else {
      setGreeting("Good Night!");
    }
  }, []);

  // Clock component
  const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
      const intervalId = setInterval(() => {
        setTime(new Date());
      }, 1000);

      return () => clearInterval(intervalId);
    }, []);

    return (
      <Text fontSize={"xl"} style={{ textDecoration: "uppercase" }}>
        {time.toLocaleTimeString()}
      </Text>
    );
  };

  // Fetch user data
  useEffect(() => {
    const userId = user.uid;
    const userRef = ref(database, `users/${userId}`);
    const paymentHistoryRef = ref(database, `users/${userId}/paymentHistory`);
    const installmentsRef = ref(database, `CustomerInstallment/${userId}`);

    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserData([data]);
      } else {
        toast({
          title: "No Data Found",
          description: "No user data available.",
          status: "warning",
        });
      }
    });

    const unsubscribePaymentHistory = onValue(paymentHistoryRef, (snapshot) => {
      const historyInfo = snapshot.val();
      if (historyInfo) {
        setPaymentHistory(Object.values(historyInfo));
      }
    });

    const unsubscribeInstallments = onValue(installmentsRef, (snapshot) => {
      const installmentsInfo = snapshot.val();
      if (installmentsInfo) {
        setInstallments(Object.values(installmentsInfo));
      }
      setLoading(false);
    });

    return () => {
      unsubscribeUser();
      unsubscribePaymentHistory();
      unsubscribeInstallments();
    };
  }, [user.uid, toast]);

  // Calculate functions for payments and installments
  const calculateTotalPaid = () => {
    return paymentHistory.reduce(
      (acc, item) => acc + (item?.amountPaid || 0),
      0
    );
  };

  const calculateTotalEmi = () => {
    return userData.length > 0 ? userData[0].totalEmiMonths || 0 : 0;
  };

  const calculateProgress = () => {
    const totalEmi = calculateTotalEmi();
    const totalPaidEmi = paymentHistory.length;
    return totalEmi > 0 ? (totalPaidEmi / totalEmi) * 100 : 0;
  };

  const getNextInstallmentDate = () => {
    const dueDateNow = new Date();
    const nextInstallment = installments
      .filter((installment) => new Date(installment.dueDate) > dueDateNow)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

    return nextInstallment ? nextInstallment.dueDate : null;
  };

  const nextInstallmentDate = getNextInstallmentDate();

  const handleCloseBanner = () => {
    setBannerVisible(false);
  };

  return (
    <AppLayout>
      {bannerVisible && (
        <Box
          p={2}
          mb={2}
          bg={colorMode === "dark" ? "gray.900" : "blue.800"}
          color="white"
          borderRadius="md"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text textAlign="center" flexGrow={1}>
            Welcome to the Ad Finance Customer Portal!
          </Text>
          <IconButton
            background={'transparent'}
            onClick={handleCloseBanner}
            aria-label="Close banner"
            icon={<LuXCircle />}
          />
        </Box>
      )}

      <Container maxW="container.xl" py={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            {userData.length > 0 ? (
              <Text>
                {greeting} 🙌 {userData[0].firstName} {userData[0].lastName}
              </Text>
            ) : (
              <Text>No user data available.</Text>
            )}
          </Text>
          <Text id="clock" fontSize="lg" fontWeight="bold">
            <Clock />
          </Text>
        </Flex>

        {loading ? (
          <VStack spacing={2}>
            <Spinner size="xl" />
            <Text>Loading...</Text>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={12}>
            <Card borderWidth={1} borderRadius="md" boxShadow="md">
              <CardBody>
                {userData.map((user, index) => (
                  <VStack align="start" spacing={2} key={index}>
                    <Text fontWeight="bold">Customer Details</Text>
                    <Flex justify="space-between" width="full">
                      <Text>Customer Id:</Text>
                      <Text>{user.customerId}</Text>
                    </Flex>
                    <Flex justify="space-between" width="full">
                      <Text>Loan Amount:</Text>
                      <Text>{user.loanValue}</Text>
                    </Flex>
                    <Flex justify="space-between" width="full">
                      <Text>EMIs for:</Text>
                      <Text>{user.totalEmiMonths} Months</Text>
                    </Flex>
                    <Flex justify="space-between" width="full">
                      <Text>Mobile:</Text>
                      <Text>{user.mobile}</Text>
                    </Flex>
                    <Flex justify="space-between" width="full">
                      <Text>Date of Birth:</Text>
                      <Text>{user.dateOfBirth}</Text>
                    </Flex>
                    <Flex justify="space-between" width="full">
                      <Text>Customer Document:</Text>
                      <Text>
                        {user.customerDocumentUploaded ? (
                          <Text>
                            <LuCheck color="green" /> Uploaded
                          </Text>
                        ) : (
                          <Text>
                            <LuXCircle color="red" /> Not Uploaded
                          </Text>
                        )}
                      </Text>
                    </Flex>
                    <Flex justify="space-between" width="full">
                      <Text>Guarantor Document:</Text>
                      <Text>
                        {user.guarantorDocumentUploaded ? (
                          <Text>
                            <LuCheck color="green" /> Uploaded
                          </Text>
                        ) : (
                          <Text>
                            <LuXCircle color="red" /> Not Uploaded
                          </Text>
                        )}
                      </Text>
                    </Flex>
                    <Flex justify="space-between" width="full">
                      <Text>Aadhar Number:</Text>
                      <Text>{user?.documents?.customer?.adharNumber}</Text>
                    </Flex>
                    <Flex justify="space-between" width="full">
                      <Text>Pancard Number:</Text>
                      <Text>{user?.documents?.customer?.panCardNumber}</Text>
                    </Flex>
                  </VStack>
                ))}
              </CardBody>
            </Card>
            <Card borderWidth={1} borderRadius="md" boxShadow="md">
              <CardBody>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Payment Info
                </Text>
                {paymentHistory.length > 0 ? (
                  <>
                    <Text>
                      Total Installments: {calculateTotalEmi()} Months
                    </Text>
                    <Text>Total Amount Paid: {calculateTotalPaid()}</Text>
                    <Progress
                      value={calculateProgress()}
                      colorScheme="blue"
                      size="sm"
                      thickness="1px"
                      borderRadius={20}
                      mt={4}
                    />
                    <Text mt={2} fontSize="md" fontWeight="bold">
                      {`${Math.round(calculateProgress())}% Completed`}
                    </Text>
                    {nextInstallmentDate && (
                      <Text mt={2} fontSize="md" fontWeight="bold" color="teal">
                        Next Installment Due Date:{" "}
                        {new Date(nextInstallmentDate).toLocaleDateString()}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text>No payment information available.</Text>
                )}
              </CardBody>
            </Card>
          </SimpleGrid>
        )}
      </Container>
    </AppLayout>
  );
};

export default DashContent;
