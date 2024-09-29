import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  HStack,
  Select,
  Icon,
  Badge,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { LuEye } from "react-icons/lu";
import AppLayout from "../layout/AppShell";
import Pagination from "../components/pagination";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../config/firebase";
import useDataStore from "../zustand/userDataStore";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const InstallmentPage = () => {
  const navigate = useNavigate();
  const user = useDataStore((state) => state.user);
  const [installments, setInstallments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  const formatMonthFromDate = (dateString) => {
    const date = new Date(dateString);
    return monthNames[date.getMonth()]; 
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with zero if needed
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()]; // Get month name
    const year = date.getFullYear(); // Get full year
  
    return `${day}-${month}-${year}`; // Return formatted date as DD-Month-YYYY
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return <Badge colorScheme="green">{status}</Badge>;
      case "Pending":
        return <Badge colorScheme="orange">{status}</Badge>;
      case "Upcoming":
        return <Badge colorScheme="red">{status}</Badge>;
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchInstallments = async () => {
      if (!user) return;
      setLoading(true);

      const installmentRef = ref(database, `CustomerInstallment/${user.uid}`);
      const snapshot = await get(installmentRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("data", data)
        const installmentArray = Object.keys(data).map(key => ({
          ...data[key],
          month: parseInt(key, 10),
        }));
        setInstallments(installmentArray);
        console.log("instament", installments)
      } else {
        setInstallments([]);
      }

      setLoading(false);
    };

    fetchInstallments();
  }, [user]);

  const filteredData = installments.filter((installment) => {
    const matchesStatus =
      statusFilter === "All" || installment.status === statusFilter;
    const dueMonthName = formatMonthFromDate(installment.dueDate || installment.paymentDate);
    const matchesSearch = dueMonthName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AppLayout>
      <Box p={4}>
        <Heading mb={4}>Installment Management</Heading>
        <HStack mb={4}>
          <Select
            placeholder="Filter by status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Upcoming">Upcoming</option>
          </Select>
          <HStack position="relative">
            <Input
              placeholder="Search by month..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              pr="4.5rem"
            />
            <Icon as={FiSearch} position="absolute" right="1.5rem" />
          </HStack>
        </HStack>

        {loading ? (
          <Box textAlign="center" my={4}>
            <Spinner size="xl" />
            <Text mt={2}>Please wait...</Text>
          </Box>
        ) : (
          <>
            <Box
              overflowX="auto"
              maxH="60vh"
              borderWidth="1px"
              borderRadius="md"
              mb={4}
            >
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Installment Month</Th>
                    <Th>Amount Due</Th>
                    <Th>Status</Th>
                    <Th>Due Date</Th>
                    <Th>Payment Date</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedData.map((installment) => {
                    const dueMonthName = formatMonthFromDate(installment.dueDate || installment.paymentDate);

                    return (
                      <Tr key={installment.month}>
                        <Td>{dueMonthName}</Td>
                        <Td>
                          {installment.status === "Paid" 
                            ? installment.amountPaid 
                            : installment.amount.toFixed(2)}
                        </Td>
                        <Td>{getStatusBadge(installment.status)}</Td>
                        <Td>{formatDate(installment.dueDate)}</Td>
                        <Td>{formatDate(installment.paymentDate)}</Td>
                        <Td>
                          <Button
                            onClick={() => {
                              const month = installment.month;
                              if (month !== undefined) {
                                navigate(`/emi/details/${month}`);
                              } else {
                                console.error("Installment month is undefined");
                              }
                            }}
                            variant="outline"
                            colorScheme="blue"
                            leftIcon={<LuEye />}
                          >
                            View
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Box>
    </AppLayout>
  );
};

export default InstallmentPage;
