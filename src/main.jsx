import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import UserRoute from './common/UserRoutes.jsx'
import './App.css'
import './Font.css'; 
import App from './App.jsx'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

createRoot(document.getElementById('root')).render(
  <ChakraProvider theme={theme}>
  <StrictMode>
    <UserRoute>
      <App/>
    </UserRoute>
  </StrictMode>,
</ChakraProvider>
)

