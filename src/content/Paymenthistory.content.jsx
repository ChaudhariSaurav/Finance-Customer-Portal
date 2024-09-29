import React, { useEffect, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import AppLayout from "../layout/AppShell";
import { database } from "../config/firebase";
import useDataStore from "../zustand/userDataStore";
import {
  Box,
  Badge,
  Spinner,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Stack,
  Flex,
  Select,
  Button,
} from "@chakra-ui/react";
import Pagination from "../components/pagination";
import jsPDF from "jspdf";
import "jspdf-autotable";

function PaymentHistory() {
  const { user } = useDataStore();
  const userId = user.uid;
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const itemsPerPage = 5;

  useEffect(() => {
    const paymentHistoryRef = ref(database, `users/${userId}/paymentHistory`);

    const unsubscribe = onValue(
      paymentHistoryRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const paymentsArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setPaymentHistory(paymentsArray);
        } else {
          setPaymentHistory([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching payment history:", error);
        setError("Failed to load payment history.");
        setLoading(false);
      }
    );

    return () => {
      off(paymentHistoryRef);
      unsubscribe();
    };
  }, [userId]);

  const formatDate = (dateString, useDDMMFormat = false) => {
    const date = new Date(dateString);
    
    // Options for date and time formatting
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Enable AM/PM format
    };
  
    const formattedDate = date.toLocaleString(undefined, options);
  
    // Split the date and time
    const [datePart, timePart] = formattedDate.split(', ');
  
    // Format the date part based on the desired format
    const [month, day, year] = datePart.split('/');
    const formattedDateFinal = useDDMMFormat
      ? `${day}/${month}/${year}` // DD/MM/YYYY
      : `${month}/${day}/${year}`; // MM/DD/YYYY
  
    return `${formattedDateFinal}, ${timePart}`;
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return <Badge colorScheme="green">Paid</Badge>;
      case "Upcoming":
        return <Badge colorScheme="orange">Upcoming</Badge>;
      case "Pending":
        return <Badge colorScheme="red">Pending</Badge>;
      default:
        return null;
    }
  };

  const filteredPayments = paymentHistory.filter((payment) => {
    if (filter === "all") return true;
    return payment.status === filter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const downloadTransactionHistory = () => {
    const doc = new jsPDF();
    doc.text("Transaction History", 14, 16);
    
    const tableData = filteredPayments.map(payment => [
      payment.amountPaid,
      formatDate(payment.paymentDate),
      payment.razorpay_id,
      payment.status
    ]);

    doc.autoTable({
      head: [['Amount Paid', 'Payment Date', 'Payment ID', 'Status']],
      body: tableData,
      startY: 20,
    });

    doc.save("transaction_history.pdf");
  };

  if (loading) {
    return (
      <AppLayout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Spinner size="xl" />
          <Text ml={4}>Please wait...</Text>
        </Box>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Text color="red.500">{error}</Text>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Heading as="h4" mb={4}>
        Payment History
      </Heading>

      {/* Filter Dropdown */}
      <Select
        placeholder="Select status"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        mb={4}
      >
        <option value="all">All</option>
        <option value="Paid">Paid</option>
        <option value="Pending">Pending</option>
        <option value="Upcoming">Upcoming</option>
      </Select>

      <Card
        borderWidth="2px"
        transition="all 0.3s"
        _hover={{
          shadow: "xl",
          borderColor: "blue.800",
        }}
        mb={4}
      >
        <CardBody>
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold">Download Transaction History</Text>
            <Button onClick={downloadTransactionHistory} colorScheme="blue">
              Download
            </Button>
          </Flex>
        </CardBody>
      </Card>

      {currentItems.length > 0 ? (
        <SimpleGrid columns={[1, 2, 3]} spacing={4}>
          {currentItems.map((payment) => (
            <Card
              key={payment.id}
              borderWidth="2px"
              transition="all 0.3s"
              _hover={{
                shadow: "xl",
                borderColor: "blue.800",
              }}
            >
              <CardBody>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">Amount:</Text>
                    <Text fontWeight="bold">Date:</Text>
                    <Text fontWeight="bold">Payment Id:</Text>
                    <Text fontWeight="bold">Status:</Text>
                  </Box>
                  <Box textAlign="right">
                    <Text>{payment.amountPaid}</Text>
                    <Text fontSize={'xs'} color={'gray.500'}>{formatDate(payment.paymentDate, true)}</Text>
                    <Text>{payment.razorpay_id}</Text>
                    <Text>{getStatusBadge(payment.status)}</Text>
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Text>No payment history found.</Text>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </AppLayout>
  );
}

export default PaymentHistory;
