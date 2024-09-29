import UserRoute from './common/UserRoutes'
import AppLayout from './layout/AppShell';
import Layout from './layout/Screen';
import useDataStore from './zustand/userDataStore';

function App() {
  const {isLoggedIn } = useDataStore(); // Get the login state
  console.log({isLoggedIn})

  return (
    <UserRoute>
      {isLoggedIn ? <AppLayout/> : <Layout />}
    </UserRoute>

  )
}

export default App
