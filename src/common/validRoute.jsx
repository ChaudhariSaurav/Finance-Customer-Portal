import { Navigate } from "react-router-dom";
import NotFoundError from "../error/404";
import Dashboard from "../pages/dashboard";
import HistoryContent from "../content/Paymenthistory.content";
import FinalDocuments from "../content/TotalDocumet.content";
import GuarantorUpload from "../pages/guranterDocs";
import CustomerUpload from "../pages/customerDocs";
import EmiPay from "../content/EmiPay";
import EmiDetails from "../content/EmiDetails";
import PaymentHistory from "../content/Paymenthistory.content";
import HelpCenter from "../content/HelpCenter";
import Profile from "../content/Profile";
import ChangePass from "../content/ChangePass";
import PaymentReceipt from "../content/PaymentReceipt";



export const ValidAuthroutes = [
    { path: "/*", element: <Navigate to="/dashboard" replace={true} /> },
    { path: "/dashboard", element: <Dashboard/> },
    { path: "/history", element: <HistoryContent/> },
    { path: "/documents/customer", element: <CustomerUpload/> },
    { path: "/documents/final", element: <FinalDocuments/> },
    { path: "/documents/guranter", element: <GuarantorUpload/> },
    { path: "/emi/pay", element: <EmiPay/> },
    { path: "/emi/details/:month", element: <EmiDetails/> },
    { path: "/payment-history", element: <PaymentHistory/> },
    { path: "/help-center", element: <HelpCenter/> },
    { path: "/customer-profile", element: <Profile/> },
    { path: "/change-password", element: <ChangePass/> },
    { path: "/*", element: <NotFoundError /> },
];