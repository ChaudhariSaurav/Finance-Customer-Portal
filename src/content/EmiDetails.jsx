"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { ref, get, set, update } from "firebase/database";
import { database } from "../config/firebase";
import useDataStore from "../zustand/userDataStore";
import AppLayout from "../layout/AppShell";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Image,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Container,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Progress,
  Tooltip,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Icon,
} from "@chakra-ui/react";
import {
  LuChevronLeft,
  LuCreditCard,
  LuPrinter,
  LuCalendar,
  LuClock,
  LuDollarSign,
  LuCheckCircle,
  LuAlertCircle,
  LuDownload,
  LuIndianRupee,
} from "react-icons/lu";
import { handlePayment } from "../service/auth";
import {
  Document,
  Page,
  Text as PDFText,
  View,
  StyleSheet,
  PDFViewer,
  Image as PDFImage,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { Font } from "@react-pdf/renderer";

// Register a Unicode-compatible font
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const watermarkURL =
  "https://ik.imagekit.io/laxmifinance/IMG-20240603-WA0018.jpg?updatedAt=1720653923997";

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Roboto",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#1a365d",
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2a4365",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
    padding: 5,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  signatureBox: {
    borderTopWidth: 1,
    borderColor: "#2a4365",
    width: "30%",
    paddingTop: 10,
    fontSize: 12,
    textAlign: "center",
    color: "#2a4365",
  },
  stamp: {
    width: 100,
    height: 100,
    position: "absolute",
    top: 150,
    right: 30,
    opacity: 0.7,
  },
  customerPhoto: {
    width: 100,
    height: 100,
    marginBottom: 20,
    alignSelf: "center",
    borderRadius: 50, // Ensures a circular image
    objectFit: "cover", // Ensures the image fits well in the bounds
  },

  qrCode: {
    position: "absolute",
    top: 150,
    left: 30,
    width: 100,
    height: 100,
  },

  termsAndConditionsHeader: {
    fontSize: 12,
    marginTop: 30,
    marginBottom: 10,
    textAlign: "center",
    borderTopColor: "#000000",
  },

  termsAndConditions: {
    fontSize: 10,
    marginBottom: 30,
    textAlign: "justify",
    color: "#4a5568",
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  watermark: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    zIndex: -1,
  },
});

// PDF Document component
const PaymentReceiptPDF = ({
  customerName,
  customerId,
  payments,
  stampURL,
  customerPhoto,
  qrCodeData,
  month,
}) => {
  const currentDate = new Date();
  const formattedDate = `${currentDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${currentDate.toLocaleString("default", {
    month: "long",
  })}-${currentDate.getFullYear()}`;
  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour12: false,
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFImage src={watermarkURL} style={styles.watermark} />

        {qrCodeData && (
          <View style={styles.qrCode}>
            <PDFImage src={qrCodeData} />
          </View>
        )}
        <PDFText style={styles.header}>J.R. GROUP'S MICROFINANCE</PDFText>
        <PDFText style={styles.subHeader}>Payment Receipt</PDFText>
        <PDFText style={styles.subHeader}>
          Customer Name: {customerName}
        </PDFText>
        <PDFText style={styles.subHeader}>Customer ID: {customerId}</PDFText>

        {customerPhoto && (
          <PDFImage
            src={customerPhoto}
            style={styles.customerPhoto}
            onLoad={() => console.log("Image loaded successfully")}
            onError={() => console.log("Error loading image")}
          />
        )}

        <View style={styles.table}>
          <View style={[styles.tableRow, { backgroundColor: "#2a4365" }]}>
            <View style={styles.tableCol}>
              <PDFText
                style={[
                  styles.tableCell,
                  { color: "white", fontWeight: "bold" },
                ]}
              >
                Payment Date
              </PDFText>
            </View>
            <View style={styles.tableCol}>
              <PDFText
                style={[
                  styles.tableCell,
                  { color: "white", fontWeight: "bold" },
                ]}
              >
                Installment Month
              </PDFText>
            </View>
            <View style={styles.tableCol}>
              <PDFText
                style={[
                  styles.tableCell,
                  { color: "white", fontWeight: "bold" },
                ]}
              >
                Amount Paid
              </PDFText>
            </View>
            <View style={styles.tableCol}>
              <PDFText
                style={[
                  styles.tableCell,
                  { color: "white", fontWeight: "bold" },
                ]}
              >
                Payment ID
              </PDFText>
            </View>
          </View>
          {payments.map((payment, index) => (
            <View
              style={[
                styles.tableRow,
                { backgroundColor: index % 2 === 0 ? "#f0f4f8" : "#e2e8f0" },
              ]}
              key={index}
            >
              <View style={styles.tableCol}>
                <PDFText style={styles.tableCell}>{payment.date}</PDFText>
              </View>
              <View style={styles.tableCol}>
                <PDFText style={styles.tableCell}>
                  {payment.installment}
                </PDFText>
              </View>
              <View style={styles.tableCol}>
                <PDFText style={styles.tableCell}>Rs {payment.amount}</PDFText>
              </View>
              <View style={styles.tableCol}>
                <PDFText style={styles.tableCell}>{payment.paymentId}</PDFText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <PDFText>B.M Signature</PDFText>
          </View>
          <View style={styles.signatureBox}>
            <PDFText>A.M Signature</PDFText>
          </View>
          <View style={styles.signatureBox}>
            <PDFText>Customer Signature</PDFText>
          </View>
        </View>

        <View
          style={{
            ...styles.termsAndConditionsHeader,
            color: "#4a5568",
            fontWeight: "extrabold",
          }}
        >
          <PDFText>Terms and Conditions:</PDFText>
        </View>
        <View
          style={{
            ...styles.termsAndConditions,
            marginBottom: 20,
            padding: 5,
            color: "#4a5568",
          }}
        >
          <PDFText style={{ marginBottom: 10 }}>
            1.{" "}
            <PDFText style={{ fontWeight: "bold" }}>
              Accuracy of Information:
            </PDFText>{" "}
            I hereby agree and declare that the information provided above is
            true and correct to the best of my knowledge and belief. I also
            declare that I have not withheld any information regarding any
            losses. If any information mentioned above is found to be false or
            any important information is found to have been withheld, I
            understand that I may be held legally responsible for it.
          </PDFText>
          <PDFText style={{ marginBottom: 10 }}>
            2.{" "}
            <PDFText style={{ fontWeight: "bold" }}>
              Cooperation with Investigation:
            </PDFText>{" "}
            I fully agree with this matter and will cooperate with the
            investigation conducted by you. If any additional information is
            found during this process, I will not object to it, and appropriate
            action can be taken by you.
          </PDFText>
          <PDFText style={{ marginBottom: 10 }}>
            3.{" "}
            <PDFText style={{ fontWeight: "bold" }}>
              Agreement to Conditions:
            </PDFText>{" "}
            I agree to these conditions and understand that they can be changed
            by you at any time. I will abide by the amended rules or conditions.
          </PDFText>
          <PDFText style={{ marginBottom: 10 }}>
            4.{" "}
            <PDFText style={{ fontWeight: "bold" }}>
              Compliance and Responsibility:
            </PDFText>{" "}
            I respectfully accept the above rules and conditions for myself and
            on behalf of my family members. I will fully comply with the
            regulations made by you and will always be ready to repay this debt
            in installments as per your instructions.
          </PDFText>
          <PDFText style={{ marginBottom: 10 }}>
            5.{" "}
            <PDFText style={{ fontWeight: "bold" }}>
              This receipt is subject to the terms and conditions of the loan
              agreement. Please retain this receipt for your records. For any
              queries, contact our customer support.
            </PDFText>
          </PDFText>
        </View>

        <View fixed style={styles.footer}>
          <PDFText
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
          <PDFText>{`${formattedDate} ${formattedTime}`}</PDFText>
        </View>

        {stampURL && <PDFImage src={stampURL} style={styles.stamp} />}
      </Page>
    </Document>
  );
};

const EmiDetails = () => {
  const { month } = useParams();
  const [emi, setEmi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [qrCodeData, setQRCodeData] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const user = useDataStore((state) => state.user);
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");

  const fetchEmiDetails = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      toast({
        title: "Authentication Error",
        description: "You must be logged in to view EMI details.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const emiRef = ref(database, `CustomerInstallment/${user.uid}/${month}`);
      const snapshot = await get(emiRef);

      if (snapshot.exists()) {
        setEmi({ ...snapshot.val(), month: parseInt(month, 10) });
      } else {
        setError("EMI details not found");
        toast({
          title: "Data Error",
          description: "EMI details not found.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      // Fetch payment history
      const historyRef = ref(database, `users/${user.uid}/paymentHistory`);
      const historySnapshot = await get(historyRef);
      if (historySnapshot.exists()) {
        setPaymentHistory(historySnapshot.val());
      }

      // Fetch customer details
      const customerRef = ref(database, `users/${user.uid}`);
      const customerSnapshot = await get(customerRef);
      if (customerSnapshot.exists()) {
        setCustomerDetails(customerSnapshot.val());
      }
    } catch (err) {
      setError("Failed to fetch EMI details");
      console.error(err);
      toast({
        title: "Fetch Error",
        description: "There was an issue fetching EMI details.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [user, month, toast]);

  useEffect(() => {
    fetchEmiDetails();
  }, [fetchEmiDetails]);

  useEffect(() => {
    const generateQR = async () => {
      if (emi && customerDetails) {
        const data = {
          customerName:
            `${customerDetails?.firstName} ${customerDetails?.lastName}` ||
            user.email,
          customerId: customerDetails?.customerId || user.uid,
          payments: [
            {
              date: formatDate(emi.paymentDate),
              installment: month,
              amount: emi.amountPaid || "",
              paymentId: emi.razorpay_id,
            },
          ],
        };
        const qrCode = await generateQRCode(data);
        setQRCodeData(qrCode);
      }
    };

    generateQR();
  }, [customerDetails, emi, month, user.email]);

  const handleMakePayment = async () => {
    if (!user || !emi || !acceptedTerms) {
      toast({
        title: "Terms and Conditions",
        description:
          "Please accept the terms and conditions before proceeding with the payment.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setPaymentProcessing(true);
    try {
      const result = await handlePayment(
        user.uid,
        emi.month,
        emi.amount,
        toast
      );

      if (result.success) {
        const updatedData = {
          ...emi,
          status: "Paid",
          paymentDate: new Date().toISOString(),
          paymentId: result.response.razorpay_payment_id,
        };

        await update(
          ref(database, `CustomerInstallment/${user.uid}/${month}`),
          updatedData
        );
        await update(ref(database, `users/${user.uid}/paymentStatus`), {
          lastPayment: updatedData.paymentDate,
          status: "Paid",
        });

        setEmi(updatedData);
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Update payment history
        const newPaymentHistory = [...paymentHistory, updatedData];
        setPaymentHistory(newPaymentHistory);
        await set(
          ref(database, `users/${user.uid}/paymentHistory`),
          newPaymentHistory
        );

        // Refresh EMI details
        fetchEmiDetails();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          error.message ||
          "There was an issue processing your payment. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePrint = () => {
    setShowPDF(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const colorScheme =
      status === "Paid" ? "green" : status === "Pending" ? "orange" : "red";
    return <Badge colorScheme={colorScheme}>{status}</Badge>;
  };

  const MotionBox = motion(Box);

  const generateQRCode = async (data) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(data));
      return qrCodeDataURL;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formatMonthFromDate = (dateString) => {
    const date = new Date(dateString);
    return monthNames[date.getMonth()];
  };

  if (loading) {
    return (
      <AppLayout>
        <Box textAlign="center" my={20}>
          <Spinner size="xl" />
          <Text mt={4}>Loading EMI details...</Text>
        </Box>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Alert status="error" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxW="container.xl" p={4}>
        <Breadcrumb
          spacing="8px"
          separator={<LuChevronLeft color="gray.500" />}
          mb={4}
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/emi/pay">
              EMI Payments
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Installment {month}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <AnimatePresence>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg={bgColor}
            borderColor={borderColor}
            boxShadow="lg"
          >
            <Box p={6}>
              <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <Heading as="h1" size="xl" color={textColor}>
                  Installment Details for Month {month}
                </Heading>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                <VStack align="stretch" spacing={4}>
                  <Stat>
                    <StatLabel>Customer ID</StatLabel>
                    <StatNumber>
                      {customerDetails?.customerId || user.uid}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>
                      Amount {emi.status === "Paid" ? "Paid" : "Due"}
                    </StatLabel>
                    <StatNumber>
                      ₹{emi.amount !== undefined ? emi.amount.toFixed(2) : 0}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Status</StatLabel>
                    <StatNumber>{getStatusBadge(emi.status)}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>
                      {emi.status === "Paid" ? "Paid On" : "Due Date"}
                    </StatLabel>
                    <StatNumber>
                      {emi.status === "Paid"
                        ? formatDate(emi.paymentDate)
                        : formatDate(emi.dueDate)}
                    </StatNumber>
                  </Stat>
                  {emi.status === "Paid" && (
                    <Stat>
                      <StatLabel>Payment ID</StatLabel>
                      <StatNumber>{emi.razorpay_id}</StatNumber>
                    </Stat>
                  )}
                </VStack>

                <VStack align="stretch" spacing={4}>
                  {emi.status === "Paid" ? (
                    <Button
                      leftIcon={<LuPrinter />}
                      colorScheme="green"
                      onClick={handlePrint}
                      size="lg"
                      width="100%"
                    >
                      Print Receipt
                    </Button>
                  ) : (
                    <>
                      <Button
                        leftIcon={<LuCreditCard />}
                        colorScheme="blue"
                        onClick={handleMakePayment}
                        size="lg"
                        isLoading={paymentProcessing}
                        loadingText="Processing Payment"
                        width="100%"
                        isDisabled={!acceptedTerms}
                      >
                        Make Payment
                      </Button>
                      <Checkbox
                        isChecked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                      >
                        I accept the terms and conditions
                      </Checkbox>
                    </>
                  )}
                  <Text fontSize="sm" color={textColor}>
                    Please ensure timely payment to avoid late fees.
                  </Text>
                  <Progress
                    value={emi.status === "Paid" ? 100 : 0}
                    colorScheme={emi.status === "Paid" ? "green" : "orange"}
                    size="sm"
                    borderRadius="full"
                  />
                  <Flex justifyContent="space-between">
                    <Tooltip label="Due Date" placement="top">
                      <Box>
                        <LuCalendar />
                        <Text fontSize="xs">{formatDate(emi.dueDate)}</Text>
                      </Box>
                    </Tooltip>
                    <Tooltip label="Amount" placement="top">
                      <Box>
                        <LuIndianRupee />
                        <Text fontSize="xs">{emi.amount !== undefined ? emi.amount.toFixed(2) : 0}</Text>
                      </Box>
                    </Tooltip>
                    <Tooltip label="Status" placement="top">
                      <Box>
                        {emi.status === "Paid" ? (
                          <LuCheckCircle color="green" />
                        ) : (
                          <LuAlertCircle color="orange" />
                        )}
                        <Text fontSize="xs">{emi.status}</Text>
                      </Box>
                    </Tooltip>
                  </Flex>
                </VStack>
              </SimpleGrid>

              <Accordion allowToggle mt={8}>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Payment History
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Amount</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {paymentHistory.map((payment, index) => (
                          <Tr key={index}>
                            <Td>{formatDate(payment.paymentDate)}</Td>
                            <Td>₹{payment.amountPaid}</Td>
                            <Td>{getStatusBadge(payment.status)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          </MotionBox>
        </AnimatePresence>

        <Modal isOpen={showPDF} onClose={() => setShowPDF(false)} size="full">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Payment Receipt</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <PDFViewer width="100%" height="400px">
                <PaymentReceiptPDF
                  customerName={
                    `${customerDetails?.firstName} ${customerDetails?.lastName}` ||
                    user.email
                  }
                  customerId={customerDetails?.customerId || user.uid}
                  payments={[
                    {
                      date: formatDate(emi.paymentDate),
                      installment: month,
                      amount: emi.amountPaid || "",
                      paymentId: emi.razorpay_id,
                    },
                    ...(paymentHistory.length > 0 &&
                    parseInt(month) !==
                      parseInt(
                        formatMonthFromDate(
                          paymentHistory[paymentHistory.length - 1].paymentDate
                        )
                      ) &&
                    emi.razorpay_id !==
                      paymentHistory[paymentHistory.length - 1].razorpay_id
                      ? [
                          {
                            date: formatDate(
                              paymentHistory[paymentHistory.length - 1]
                                ?.paymentDate
                            ),
                            installment: parseInt(month) + 1,
                            amount:
                              paymentHistory[paymentHistory.length - 1]
                                .amountPaid,
                            paymentId:
                              paymentHistory[paymentHistory.length - 1]
                                .razorpay_id,
                          },
                        ]
                      : []),
                  ]}
                  customerPhoto={customerDetails?.photoURL}
                  stampURL="https://ik.imagekit.io/xzgem7hpv/Ad%20FInance/stamp?updatedAt=1727545912474"
                  qrCodeData={qrCodeData}
                />
              </PDFViewer>

              <PDFDownloadLink
                document={
                  <PaymentReceiptPDF
                    customerName={
                      `${customerDetails?.firstName} ${customerDetails?.lastName}` ||
                      user.email
                    }
                    customerId={customerDetails?.customerId || user.uid}
                    payments={[
                      {
                        date: formatDate(emi.paymentDate),
                        installment: month,
                        amount: emi.amountPaid || "",
                        paymentId: emi.razorpay_id,
                      },
                      ...(paymentHistory.length > 0 &&
                      parseInt(month) !==
                        parseInt(
                          formatMonthFromDate(
                            paymentHistory[paymentHistory.length - 1]
                              .paymentDate
                          )
                        ) &&
                      emi.razorpay_id !==
                        paymentHistory[paymentHistory.length - 1].razorpay_id
                        ? [
                            {
                              date: formatDate(
                                paymentHistory[paymentHistory.length - 1]
                                  .paymentDate
                              ),
                              installment: parseInt(month) + 1,
                              amount:
                                paymentHistory[paymentHistory.length - 1]
                                  .amountPaid,
                              paymentId:
                                paymentHistory[paymentHistory.length - 1]
                                  .razorpay_id,
                            },
                          ]
                        : []),
                    ]}
                    customerPhoto={customerDetails?.photoURL}
                    stampURL="https://ik.imagekit.io/xzgem7hpv/Ad%20FInance/stamp?updatedAt=1727545912474"
                    qrCodeData={qrCodeData}
                  />
                }
                fileName={`${
                  customerDetails?.customerId || user.uid
                }_${formatMonthFromDate(emi.paymentDate)}.pdf`}
              >
                {({ loading }) =>
                  loading ? (
                    <Button isLoading colorScheme="blue" mt={4}>
                      Generating PDF...
                    </Button>
                  ) : (
                    <Button
                      mt={4}
                      variant="outline"
                      colorScheme="green"
                      size="sm"
                      width={'100%'}
                      leftIcon={<Icon as={LuDownload} color="green.500" />}
                    >
                      Download Receipt
                    </Button>
                  )
                }
              </PDFDownloadLink>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </AppLayout>
  );
};

export default EmiDetails;
