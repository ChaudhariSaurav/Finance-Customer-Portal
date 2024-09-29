import React from 'react';
import { HStack, Button, Text } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <HStack spacing={4} mt={4}>
      <Button onClick={handlePrevious} disabled={currentPage === 1} leftIcon={<LuChevronLeft />}>
        Previous
      </Button>
      <Text>Page {currentPage} of {totalPages}</Text>
      <Button onClick={handleNext} disabled={currentPage === totalPages} rightIcon={<LuChevronRight />}>
        Next
      </Button>
    </HStack>
  );
};

export default Pagination;
