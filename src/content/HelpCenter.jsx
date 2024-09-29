import React from 'react';
import {
  Container,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Text,
} from '@chakra-ui/react';
import AppLayout from '../layout/AppShell';

const HelpCenter = () => {
  const helpTopics = [
    {
      title: 'Getting Started',
      content: 'Learn how to create an account, set up your profile, and start using the app.',
    },
    {
      title: 'Managing Your Loans',
      content: 'Find out how to apply for loans, check your status, and manage your repayments.',
    },
    {
      title: 'Payment History',
      content: 'View your payment history, track your installments, and understand your payment progress.',
    },
    {
      title: 'Support and Contact',
      content: 'Need help? Contact our support team for assistance with your queries.',
    },
    {
      title: 'FAQs',
      content: 'Browse frequently asked questions to quickly find the answers you need.',
    },
    // Additional FAQs
    {
      title: 'What should I do if I forget my password?',
      content: 'If you forget your password, click on "Forgot Password" on the login page and follow the instructions to reset it.',
    },
    {
      title: 'How can I update my profile information?',
      content: 'You can update your profile information in the settings section of the app. Make sure to save changes after editing.',
    },
    {
      title: 'How do I contact customer support?',
      content: 'You can contact customer support via the "Support" section in the app or by emailing support@example.com.',
    },
    {
      title: 'What are the repayment options available?',
      content: 'We offer various repayment options, including automatic deductions, bank transfers, and online payment methods.',
    },
    {
      title: 'How can I view my loan details?',
      content: 'You can view your loan details in the "Loans" section of the app, where all relevant information will be displayed.',
    },
    {
      title: 'Is my personal information safe?',
      content: 'Yes, we take data privacy seriously. Your personal information is encrypted and securely stored.',
    },
  ];

  return (
    <AppLayout>
      <Container maxW="container.xl" py={8}>
        <Heading as="h5" mb={6} textAlign="center">
          Help Center
        </Heading>
        <Accordion allowMultiple>
          {helpTopics.map((topic, index) => (
            <AccordionItem key={index}>
              <AccordionButton>
                <Text flex="1" textAlign="left" fontWeight="bold">
                  {topic.title}
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                {topic.content}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </AppLayout>
  );
};

export default HelpCenter;
