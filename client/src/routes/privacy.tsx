import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { Heading, Paragraph, Text, List, ListItem } from '@/components/ui/typography';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

// Constants for the Privacy Policy page
const LAST_UPDATED = "May 9, 2025";
const APP_NAME = "CentralAuth";
const PRIVACY_EMAIL = "privacy@centralauth.com";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: `${APP_NAME} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our authentication 
            and authorization services.`
  },
  {
    id: "information",
    title: "2. Information We Collect",
    content: `We collect information that you provide directly to us when you create an account, use our 
            authentication services, communicate with us, or access our API. This information may include your 
            name, email address, password (encrypted), and other profile information. We also automatically collect 
            certain information about your device, including IP address, device type, browser type, and usage statistics 
            to improve our services and security.`,
    hasList: true,
    listItems: [
      "Create an account or user profile",
      "Use our authentication services",
      "Communicate with us",
      "Access our API"
    ]
  },
  {
    id: "usage",
    title: "3. How We Use Your Information",
    content: `We use the information we collect to provide our services, process transactions, send notices, 
            respond to your inquiries, analyze usage patterns, and prevent fraud.`,
    hasList: true,
    listItems: [
      "Provide, maintain, and improve our services",
      "Process and complete transactions",
      "Send you technical notices and security alerts",
      "Respond to your comments and questions",
      "Monitor and analyze trends and usage",
      "Detect, prevent, and address fraud and security issues"
    ]
  },
  {
    id: "retention",
    title: "4. Data Retention",
    content: `We retain your information for as long as your account is active or as needed to provide you services. 
            We will also retain and use your information as necessary to comply with legal obligations, resolve 
            disputes, and enforce our agreements.`
  },
  {
    id: "security",
    title: "5. Data Security",
    content: `We implement appropriate technical and organizational measures to protect the security of your personal 
            information. However, no method of transmission over the Internet or electronic storage is 100% secure, 
            so we cannot guarantee absolute security.`
  },
  {
    id: "rights",
    title: "6. Your Rights",
    content: `Depending on your location, you may have rights regarding your personal data.`,
    hasList: true,
    listItems: [
      "Access to your personal data",
      "Correction of inaccurate data",
      "Deletion of your data",
      "Restriction or objection to processing",
      "Data portability"
    ],
    additionalContent: `To exercise these rights, please contact us using the information provided in the "Contact Us" section.`
  },
  {
    id: "changes",
    title: "7. Changes to This Privacy Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last updated" date.`
  },
  {
    id: "contact",
    title: "8. Contact Us",
    content: `If you have any questions about this Privacy Policy, please contact us at ${PRIVACY_EMAIL}.`,
    hasEmail: true
  }
];

function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity mb-8">
          <Logo />
          <Text weight="semibold">{APP_NAME}</Text>
        </Link>
        <Heading as="h1" size="3" className="mb-2">Privacy Policy</Heading>
        <Text variant="muted" size="sm">Last updated: {LAST_UPDATED}</Text>
      </header>

      <main>
        {sections.map((section) => (
          <section key={section.id} className="mb-8">
            <Heading as="h2" size="4" className="mb-3">{section.title}</Heading>
            <Paragraph>{section.content}</Paragraph>
            
            {section.hasList && (
              <>
                {section.id === "information" && (
                  <Paragraph className="mt-2">We collect information that you provide directly to us when you:</Paragraph>
                )}
                <List className="my-3">
                  {section.listItems.map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </List>
              </>
            )}
            
            {section.additionalContent && (
              <Paragraph className="mt-3">{section.additionalContent}</Paragraph>
            )}
            
            {section.hasEmail && (
              <Paragraph className="mt-2">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary hover:underline">
                  {PRIVACY_EMAIL}
                </a>.
              </Paragraph>
            )}
          </section>
        ))}
      </main>

      <footer className="mt-12 pt-8 border-t text-center">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/">Return to Home</Link>
        </Button>
        <Text variant="muted">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</Text>
      </footer>
    </div>
  );
}
