import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import AppLayout from '../layout/AppShell';
import { changeUserPassword, userSignOut } from '../service/auth';

const ChangePassword = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [oldCustomerId, setOldCustomerId] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      await changeUserPassword(oldCustomerId, oldPassword, newPassword);
      toast({
        title: "Password changed.",
        description: "Your password has been successfully changed.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onOpen();
    } catch (error) {
      toast({
        title: "Error.",
        description: error?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await userSignOut();
      window.location.href = '/';
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
   <AppLayout>
	 <Box p={5}>
      <FormControl isRequired>
        <FormLabel>Old Customer ID</FormLabel>
        <Input
          type="text"
          value={oldCustomerId}
          onChange={(e) => setOldCustomerId(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired mt={4}>
        <FormLabel>Old Password</FormLabel>
        <Input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired mt={4}>
        <FormLabel>New Password</FormLabel>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </FormControl>

      <Button
        mt={4}
        colorScheme="blue"
        onClick={handleChangePassword}
        isLoading={loading}
        loadingText="Changing..."
      >
        Change Password
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Password Changed</ModalHeader>
          <ModalBody>
            Your password has been successfully changed. Do you want to log out or continue using your account?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleLogout}>
              Log Out
            </Button>
            <Button variant="ghost" onClick={onClose}>Continue</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
   </AppLayout>
  );
};

export default ChangePassword;
