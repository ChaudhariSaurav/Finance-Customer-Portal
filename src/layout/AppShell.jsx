import React from 'react';
import { Box, Flex, useDisclosure, useColorModeValue } from '@chakra-ui/react';
import Header from '../components/header';
import Sidebar from '../components/Sidebar';


const AppLayout = ({ children }) => {
  const { isOpen, onToggle } = useDisclosure();
  const bgColor = useColorModeValue('gray.100', 'gray.800');
  const contentBgColor = useColorModeValue('white', 'gray.700');
    const appName = import.meta.env.VITE_APP_NAME || 'Ad Finance';
    const version = import.meta.env.VITE_FIREBASE_VERSION || '0.0.1';


  return (
    <Box minH="100vh" bg={bgColor}>
      <Header onToggleSidebar={onToggle} />
      <Sidebar isOpen={isOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4" transition="all 0.3s">
        <Box mt="70px" mb="60px" bg={contentBgColor} borderRadius="md" p={4} boxShadow="sm">
          {children}
        </Box>
      </Box>
      <Box
        as="footer"
        position="fixed"
        bottom={0}
        w="full"
        bg={useColorModeValue('white', 'gray.800')}
        borderTopWidth={1}
        borderTopColor={useColorModeValue('gray.200', 'gray.700')}
        p={4}
        textAlign="center"
        color={useColorModeValue('gray.600', 'gray.400')}
      >
        © {new Date().getFullYear()} {appName} - {version}. All rights reserved.
      </Box>
    </Box>
  );
};

export default AppLayout;