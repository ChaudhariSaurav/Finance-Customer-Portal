import { useNavigate } from 'react-router-dom'
import { Box, Button, Heading, Text } from '@chakra-ui/react'

export default function NotFoundError() {
  const navigate = useNavigate()
  
  return (
    <Box height="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Heading as="h1" size="4xl" fontWeight="bold" lineHeight="shorter">
        404
      </Heading>
      <Text fontWeight="medium">Oops! Page Not Found!</Text>
      <Text textAlign="center" color="gray.500" mt={2}>
        It seems like the page you're looking for <br />
        does not exist or might have been removed.
      </Text>
      <Box marginTop={6} display="flex" gap={4}>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button colorScheme="blue" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Box>
    </Box>
  )
}
