import { Navigate } from "react-router-dom";
import SignInForm from "../components/signinPage";
import RegistrationForm from "../components/registerationPage";
import ForgotPasswordPage from "../components/forgotPage";
import ForgotCustomer from "../components/forgotCustomer";
import HomePage from "../content/homePage";

export const InvalidAuthRoute = [
    { path: "/*", element: <Navigate to="/home" replace={true} /> },
    { path: "/home", element: <HomePage /> },
    { path: "/register", element: <RegistrationForm /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/forgot-customerId", element: <ForgotCustomer /> },
    { path: "/auth", element: <SignInForm /> },
];
