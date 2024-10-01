'use client'

import React, { useState, useEffect } from 'react'
import { getDatabase, ref, get, update } from 'firebase/database'
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Container,
  Grid,
  GridItem,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import AppLayout from "../layout/AppShell"
import useDataStore from "../zustand/userDataStore"

const CustomInput = React.forwardRef((props, ref) => (
  <Input ref={ref} borderColor="blue.300" _hover={{ borderColor: "blue.500" }} {...props} />
));

export default function LoanDetails() {
  const [loanDetails, setLoanDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bankData, setBankData] = useState(null)
  const [accountExists, setAccountExists] = useState(false) // New state variable

  const toast = useToast()
  const { user } = useDataStore()
  const db = getDatabase()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm()

  useEffect(() => {
    fetchLoanDetails()
  }, [])

  const fetchLoanDetails = async () => {
    if (!user || !user.uid) {
      setError("User not authenticated")
      setLoading(false)
      return
    }

    try {
      const userSnapshot = await get(ref(db, `users/${user.uid}`))
      const userData = userSnapshot.val()
      const accountInfoSnapshot = await get(ref(db, `users/${user.uid}/accountInfo`))
      const accountInfo = accountInfoSnapshot.val()

      if (userData) {
        if (accountInfo) {
          setAccountExists(true) // Set to true if account info exists
          const mappedAccountInfo = Object.entries(accountInfo).reduce((acc, [key, value]) => {
            return { ...acc, [key]: value || '' }
          }, {})

          const loanDate = new Date(userData.nextDueDate)
          const options = { day: 'numeric', month: 'long', year: 'numeric' }
          const formattedLoanDate = loanDate.toLocaleDateString('hi-IN', options)

          const combinedData = {
            name: `${userData.firstName} ${userData.lastName}`,
            customerId: userData.customerId,
            accountHolderName: mappedAccountInfo.accountHolderName,
            accountNumber: mappedAccountInfo.accountNo,
            bankName: mappedAccountInfo.bankName,
            branch: mappedAccountInfo.branch,
            city: mappedAccountInfo.city,
            state: mappedAccountInfo.state,
            ifscCode: mappedAccountInfo.ifscCode,
            loanAmount: userData.loanValue,
            loanTerms: userData.totalEmiMonths,
            installment: userData.totalAmountPaid / userData.totalMonthsPaid,
            loanDate: formattedLoanDate,
          }
          setLoanDetails(combinedData)
        } else {
          setAccountExists(false) // No account info, set to false
        }
      }
    } catch (err) {
      setError("Failed to fetch loan details")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    if (!user || !user.uid) {
      toast({
        title: "Error",
        description: "User not authenticated",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      setIsSubmitting(false)
      return
    }

    try {
      await update(ref(db, `users/${user.uid}/accountInfo`), data)
      toast({
        title: "Success",
        description: "Account details saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
      fetchLoanDetails() // Fetch details after saving
      onClose() // Close modal
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save account details",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchIfscDetails = async () => {
    const ifscCode = watch("ifscCode")
    if (!ifscCode) {
      toast({
        title: "Error",
        description: "Please enter IFSC code.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`https://bank-apis.justinclicks.com/API/V1/IFSC/${ifscCode}/`)
      const data = await response.json()
      if (data && data.BANK && data.IFSC) {
        setBankData(data)
        setValue('accountHolderName', data.BANK)
      } else {
        toast({
          title: "No Data Found",
          description: "No data available for this IFSC code.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        })
        setBankData(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <Container maxW="container.lg" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h4" size="lg" textAlign="center">
            Microfinance Loan Details
          </Heading>

          {loading ? (
            <VStack spacing={2}>
              <Spinner size="xl" />
              <Text>Loading loan details...</Text>
            </VStack>
          ) : error ? (
            <Text color="red.500" textAlign="center" fontSize="xl">{error}</Text>
          ) : accountExists && loanDetails ? (
            <Box borderWidth={1} borderRadius="lg" p={6} boxShadow="md">
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                <GridItem colSpan={2}>
                  <Heading as="h5" size="md" mb={4}>Personal Information</Heading>
                </GridItem>
                <GridItem><Text><strong>Name:</strong> {loanDetails.name}</Text></GridItem>
                <GridItem><Text><strong>Customer ID:</strong> {loanDetails.customerId}</Text></GridItem>
                <GridItem colSpan={2}><Divider my={4} /></GridItem>
                
                <GridItem colSpan={2}>
                  <Heading as="h5" size="md" mb={4}>Bank Account Details</Heading>
                </GridItem>
                <GridItem><Text><strong>Account Number:</strong> {loanDetails.accountNumber}</Text></GridItem>
                <GridItem><Text><strong>Account Holder:</strong> {loanDetails.accountHolderName}</Text></GridItem>
                <GridItem><Text><strong>Bank Name:</strong> {loanDetails.bankName}</Text></GridItem>
                <GridItem><Text><strong>Branch:</strong> {loanDetails.branch}</Text></GridItem>
                <GridItem><Text><strong>City:</strong> {loanDetails.city}</Text></GridItem>
                <GridItem><Text><strong>State:</strong> {loanDetails.state}</Text></GridItem>
                <GridItem><Text><strong>IFSC Code:</strong> {loanDetails.ifscCode}</Text></GridItem>
                <GridItem colSpan={2}><Divider my={4} /></GridItem>
                
                <GridItem colSpan={2}>
                  <Heading as="h5" size="md" mb={4}>Loan Information</Heading>
                </GridItem>
                <GridItem><Text><strong>Loan Amount:</strong> ₹{loanDetails.loanAmount.toLocaleString('en-IN')}</Text></GridItem>
                <GridItem><Text><strong>Loan Term:</strong> {loanDetails.loanTerms} months</Text></GridItem>
                <GridItem><Text><strong>Installment:</strong> ₹{loanDetails.installment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text></GridItem>
                <GridItem><Text><strong>Loan Date:</strong> {loanDetails.loanDate}</Text></GridItem>
              </Grid>
            </Box>
          ) : (
            // If account doesn't exist, show the form
            <Box borderWidth={1} borderRadius="lg" p={6} boxShadow="md">
              <Heading as="h5" size="md" mb={4}>Add Account Information</Heading>
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4}>
                  <FormControl isInvalid={errors.accountHolderName}>
                    <FormLabel>Account Holder Name</FormLabel>
                    <CustomInput {...register('accountHolderName', { required: "Account holder name is required" })} />
                    {errors.accountHolderName && <Text color="red.500">{errors.accountHolderName.message}</Text>}
                  </FormControl>
                  <FormControl isInvalid={errors.accountNumber}>
                    <FormLabel>Account Number</FormLabel>
                    <CustomInput {...register('accountNumber', { required: "Account number is required" })} />
                    {errors.accountNumber && <Text color="red.500">{errors.accountNumber.message}</Text>}
                  </FormControl>
                  <FormControl isInvalid={errors.ifscCode}>
                    <FormLabel>IFSC Code</FormLabel>
                    <CustomInput
                      {...register('ifscCode', {
                        required: "IFSC code is required",
                        minLength: { value: 11, message: "IFSC code must be 11 characters" },
                        maxLength: { value: 11, message: "IFSC code must be 11 characters" }
                      })}
                      onChange={(e) => {
                        setValue('ifscCode', e.target.value.toUpperCase()); // Convert to uppercase
                      }}
                      onBlur={fetchIfscDetails} // Fetch data on blur
                    />
                    {errors.ifscCode && <Text color="red.500">{errors.ifscCode.message}</Text>}
                  </FormControl>
                  <Button colorScheme="teal" onClick={fetchIfscDetails} isLoading={loading}>
                    Fetch Bank Details
                  </Button>

                  {/* Display fetched bank details */}
                  {bankData && (
                    <Box mt={4} p={4} borderWidth={1} borderRadius="lg" borderColor="gray.200">
                      <Text><strong>Bank Name:</strong> {bankData.BANK}</Text>
                      <Text><strong>Branch:</strong> {bankData.BRANCH}</Text>
                      <Text><strong>IFSC Code:</strong> {bankData.IFSC}</Text>
                      <Text><strong>Address:</strong> {bankData.ADDRESS}</Text>
                    </Box>
                  )}
                  <Button colorScheme="blue" mt={4} isLoading={isSubmitting} type="submit">
                    Save Account Information
                  </Button>
                </VStack>
              </form>
            </Box>
          )}
        </VStack>
      </Container>
    </AppLayout>
  )
}
