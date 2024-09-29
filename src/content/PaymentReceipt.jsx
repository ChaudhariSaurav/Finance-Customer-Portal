import React from 'react';
import { useLocation } from 'react-router-dom';

const PaymentReceipt = () => {
  const location = useLocation();
  console.log(location.state); // Log the state to check its contents

  const { customerName, customerId, payments } = location.state || {}; // Use optional chaining

  // Ensure payments is defined and an array
  if (!payments || !Array.isArray(payments)) {
    return <Text>No payment data available.</Text>;
  }

  return (
    <PDFViewer width="100%" height={600}>
      <PaymentReceiptPDF 
        customerName={customerName} 
        customerId={customerId} 
        payments={payments} 
      />
    </PDFViewer>
  );
};

export default PaymentReceipt;
