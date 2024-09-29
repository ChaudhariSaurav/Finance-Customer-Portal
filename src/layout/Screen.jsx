import React, { useState } from 'react';
import {
    Box,
    Button,
    Flex,
    Spacer,
    useColorMode,
    useColorModeValue,
} from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const { toggleColorMode } = useColorMode();
    const buttonText = useColorModeValue('Switch to Dark Mode', 'Switch to Light Mode');

    return (
        <Box>
            <Flex as="nav" p={4} bg={useColorModeValue('gray.100', 'gray.900')} boxShadow="md">
                <Spacer />
                <Button onClick={toggleColorMode}>
                    {buttonText}
                </Button>
            </Flex>
            <Box p={4}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
