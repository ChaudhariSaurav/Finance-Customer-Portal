import { FiCreditCard,  FiFile, FiGrid, FiHelpCircle } from "react-icons/fi";
import { LuIndianRupee } from "react-icons/lu";
import { SlNotebook } from "react-icons/sl";

export const dashboardRoutes = [
	{ icon: FiGrid, name: "Dashboard", path: "/dashboard" },
	{ 
	  icon: FiFile, 
	  name: "Documents", 
	  path: "/documents", 
	  hasSubmenu: true,
	  submenuItems: [
		{ name: "Customer Document", path: "/documents/customer" },
		{ name: "Guranter Document", path: "/documents/guranter" },
		{ name: "Upload Document", path: "/documents/final" },
	  ]
	},
	{ 
	  icon: FiCreditCard, 
	  name: "EMI", 
	  path: "/emi", 
	  hasSubmenu: true,
	  submenuItems: [
		{ name: "EMI Payment", path: "/emi/pay" },
		{ name: "EMI Details", path: "/emi/details" },
	  ]
	},
	{ icon: LuIndianRupee , name: "Payment History", path: "/payment-history" },
	{ icon: SlNotebook  , name: "Passbook Create", path: "/passbook" },
	{ icon: SlNotebook  , name: "No Dues", path: "/No-dues-form" },
  ];
  
  export const bottomRoutes = [
	{ icon: FiHelpCircle, name: "Help Center", path: "/help-center" },
  ];