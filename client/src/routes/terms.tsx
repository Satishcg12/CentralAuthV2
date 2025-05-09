import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { Heading, Paragraph, Text } from '@/components/ui/typography';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

// Constants for the Terms of Service page
const LAST_UPDATED = "May 9, 2025";
const APP_NAME = "CentralAuth";
const CONTACT_EMAIL = "support@centralauth.com";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing or using ${APP_NAME} services, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our services.`
  },
  {
    id: "description",
    title: "2. Description of Service",
    content: `${APP_NAME} provides authentication and authorization services, including user management, 
            role-based access control, and API integrations. We reserve the right to modify, suspend, 
            or discontinue any part of the service at any time.`
  },
  {
    id: "accounts",
    title: "3. User Accounts",
    content: `You are responsible for maintaining the confidentiality of your account credentials and for all 
            activities that occur under your account. You must notify us immediately of any unauthorized use 
            or security breach of your account.`
  },
  {
    id: "security",
    title: "4. Data Security and Privacy",
    content: `We implement appropriate security measures to protect your data. Your use of the service is also 
            subject to our Privacy Policy, which describes our practices regarding the collection, use, and disclosure 
            of your personal information.`,
    hasLink: true
  },
  {
    id: "ip",
    title: "5. Intellectual Property",
    content: `All content, features, and functionality of ${APP_NAME}, including but not limited to the design, 
            software, text, graphics, logos, and icons, are owned by ${APP_NAME} and are protected by copyright, 
            trademark, and other intellectual property laws.`
  },
  {
    id: "liability",
    title: "6. Limitation of Liability",
    content: `${APP_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive 
            damages resulting from your access to or use of, or inability to access or use, the service.`
  },
  {
    id: "changes",
    title: "7. Changes to Terms",
    content: `We may update these Terms of Service from time to time. We will notify you of any changes by 
            posting the new Terms on this page and updating the "Last updated" date.`
  },
  {
    id: "contact",
    title: "8. Contact Us",
    content: `If you have any questions about these Terms, please contact us at ${CONTACT_EMAIL}.`,
    hasEmail: true
  }
];

function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity mb-8">
          <Logo />
          <Text weight="semibold">{APP_NAME}</Text>
        </Link>
        <Heading as="h1" size="3" className="mb-2">Terms of Service</Heading>
        <Text variant="muted" size="sm">Last updated: {LAST_UPDATED}</Text>
      </header>

      <main className="prose dark:prose-invert max-w-none">
        {sections.map((section) => (
          <section key={section.id} className="mb-8">
            <Heading as="h2" size="4">{section.title}</Heading>
            <Paragraph>
              {section.hasLink ? (
                <>
                  We implement appropriate security measures to protect your data. Your use of the service is also 
                  subject to our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, 
                  which describes our practices regarding the collection, use, and disclosure of your personal information.
                </>
              ) : section.hasEmail ? (
                <>
                  If you have any questions about these Terms, please contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.
                </>
              ) : (
                section.content
              )}
            </Paragraph>
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
