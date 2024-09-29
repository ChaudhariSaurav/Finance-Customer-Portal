import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  Divider,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { FiMenu, FiMoon, FiSun, FiUser, FiMail, FiLogOut, FiLock, FiTrash } from "react-icons/fi";
import { LuBell, LuCheckCheck, LuCopy } from "react-icons/lu";
import useDataStore from "../zustand/userDataStore";
import { database } from "../config/firebase";
import { ref, onValue, remove } from "firebase/database"; // Import remove
import { useNavigate } from "react-router-dom";
import { userSignOut } from "../service/auth";

const Headers = ({ onToggleSidebar }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const appName = import.meta.env.VITE_APP_NAME || "Admin Panel";
  const [userData, setUserData] = useState("");
  const [notifications, setNotifications] = useState([]);
  const { user } = useDataStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const userId = user.uid;
    const userRef = ref(database, `users/${userId}`);
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        setUserData(data);
    });

    const notificationsRef = ref(database, `users/${userId}/notifications`);
    onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Filter out notifications that are hidden
            const visibleNotifications = Object.values(data).filter(notification => notification.status === 'visible');
            setNotifications(visibleNotifications);
        }
    });
}, [user.uid]);

  const handleLogout = async () => {
    try {
      await userSignOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleProfileClick = () => {
    navigate("/customer-profile");
  };

  const handleChangePasswordClick = () => {
    navigate("/change-password");
  };

  const handleCopyCustomerId = () => {
    navigator.clipboard.writeText(userData.customerId)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copied!",
          description: "Customer ID has been copied to clipboard.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch(err => console.error("Failed to copy: ", err));
  };

  const handleDeleteNotification = (notificationId) => {
    const userId = user.uid;
    const notificationRef = ref(database, `users/${userId}/notifications/${notificationId}`);
    remove(notificationRef)
      .then(() => {
        toast({
          title: "Deleted!",
          description: "Notification has been deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        console.error("Error deleting notification:", error);
        toast({
          title: "Error!",
          description: "Failed to delete notification.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <Box
      as="header"
      bg={useColorModeValue("white", "gray.800")}
      px={4}
      position="fixed"
      w="full"
      zIndex="sticky"
      borderBottomWidth={2}
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      h="60px"
      boxShadow="sm"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <IconButton
            display={{ base: "flex", md: "none" }}
            onClick={onToggleSidebar}
            variant="outline"
            aria-label="open menu"
            icon={<FiMenu />}
            mr={2}
          />
          <Text fontSize="xl" fontWeight="bold" color={useColorModeValue("gray.800", "white")}>
            {appName}
          </Text>
        </Flex>

        <Flex alignItems="center">
          <IconButton
            icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
            aria-label="Toggle color mode"
            mr={4}
          />

          <Menu>
            <MenuButton as={Button} variant="link" cursor="pointer" minW={0} position="relative">
              <IconButton icon={<LuBell />} variant="ghost" aria-label="Notifications" />
              {notifications.length > 0 && (
                <Badge colorScheme="red" borderRadius="full" position="absolute" top={-1} right={-1}>
                  {notifications.length}
                </Badge>
              )}
            </MenuButton>
            <MenuList>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <MenuItem key={notification.id} display="flex" justifyContent="space-between" alignItems="center">
                    <Flex direction="column" flexGrow={1}>
                      <Text fontWeight="bold">{notification.title}</Text>
                      <Text fontSize="sm">{notification.description}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </Text>
                    </Flex>
                    <IconButton
                      aria-label="Delete notification"
                      icon={<FiTrash />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteNotification(notification.id)}
                    />
                  </MenuItem>
                ))
              ) : (
                <MenuItem>No new notifications</MenuItem>
              )}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} rounded={"full"} variant={"link"} cursor={"pointer"} minW={0} ml={4}>
              <Avatar
                size={"sm"}
                src={userData.photoURL || `https://avatars.dicebear.com/api/male/username.svg`}
              />
            </MenuButton>
            <MenuList>
              <MenuItem icon={copied ? <LuCheckCheck /> : <LuCopy />} onClick={handleCopyCustomerId}>
                {userData.customerId}
              </MenuItem>
              <Divider colorScheme="red" />
              <MenuItem icon={<FiUser />} onClick={handleProfileClick}>
                Profile
              </MenuItem>
              <Divider colorScheme="red" />
              <MenuItem icon={<FiLock />} onClick={handleChangePasswordClick}>
                Change Password
              </MenuItem>
              <Divider colorScheme="red" />
              <MenuItem icon={<FiMail />}>{userData.email}</MenuItem>
              <Divider colorScheme="red" />
              <MenuItem icon={<FiLogOut />} onClick={onOpen}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Logout Confirmation</ModalHeader>
          <ModalBody>Are you sure you want to logout?</ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button variant="outline" colorScheme="red" onClick={handleLogout}>
              Logout
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Headers;
