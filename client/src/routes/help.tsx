import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Logo from '@/components/logo';
import { Heading, Text } from '@/components/ui/typography';

export const Route = createFileRoute('/help')({
  component: HelpPage,
})

// Constants for the Help page
const APP_NAME = "CentralAuth";
const SUPPORT_EMAIL = "support@centralauth.com";

// FAQ data
const faqs = [
  {
    question: `What is ${APP_NAME}?`,
    answer: `${APP_NAME} is a secure authentication and authorization service that helps you manage user identities, roles, and permissions across your applications.`
  },
  {
    question: "How do I reset my password?",
    answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page and following the instructions sent to your email."
  },
  {
    question: `Can I use ${APP_NAME} with my existing application?`,
    answer: `Yes, ${APP_NAME} offers API integrations and SDKs for various programming languages and frameworks to easily integrate with your existing applications.`
  },
  {
    question: `How secure is my data with ${APP_NAME}?`,
    answer: `${APP_NAME} uses industry-standard encryption and security practices. Passwords are hashed using bcrypt, and all API requests are secured via HTTPS.`
  },
  {
    question: "Do you offer two-factor authentication (2FA)?",
    answer: "Yes, we support two-factor authentication via TOTP (Time-based One-Time Password) apps like Google Authenticator and Authy."
  }
];

// Getting started guides
const guides = [
  {
    title: "Setting Up Your Account",
    description: `Learn how to create your ${APP_NAME} account, set up your profile, and configure basic settings.`
  },
  {
    title: "Managing Users and Roles",
    description: "Understand how to add users, create custom roles, and assign permissions in your organization."
  },
  {
    title: "API Integration",
    description: "Step-by-step guide to integrating CentralAuth with your applications using our REST API."
  },
  {
    title: "Security Best Practices",
    description: "Recommendations for securing your authentication flow and protecting user data."
  }
];

// Support options
const supportOptions = [
  {
    title: "Email Support",
    description: "Our support team is available Monday through Friday, 9am to 5pm EST.",
    buttonText: "Contact Support",
    buttonLink: `mailto:${SUPPORT_EMAIL}`,
    isExternal: true
  },
  {
    title: "Documentation",
    description: "Browse our comprehensive API documentation and integration guides.",
    buttonText: "View Documentation", 
    buttonLink: "#",
    isExternal: false
  }
];

function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity mb-8">
          <Logo />
          <Text weight="semibold">{APP_NAME}</Text>
        </Link>
        <Heading as="h1" size="3" className="mb-2">Help Center</Heading>
        <Text variant="muted">Find answers to common questions and learn how to get the most out of {APP_NAME}</Text>
      </header>

      <main>
        <section className="mb-10">
          <Heading as="h2" size="4" className="mb-4">Frequently Asked Questions</Heading>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-4">
                <Heading as="h3" size="5" className="mb-2">{faq.question}</Heading>
                <Text variant="muted">{faq.answer}</Text>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <Heading as="h2" size="4" className="mb-4">Getting Started Guides</Heading>
          <div className="grid md:grid-cols-2 gap-4">
            {guides.map((guide, index) => (
              <Card key={index} className="p-4 flex flex-col h-full">
                <Heading as="h3" size="5" className="mb-2">{guide.title}</Heading>
                <Text variant="muted" className="mb-4 flex-grow">{guide.description}</Text>
                <Button variant="outline" size="sm" className="w-full">
                  View Guide
                </Button>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <Heading as="h2" size="4" className="mb-4">Contact Support</Heading>
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {supportOptions.map((option, index) => (
                <div key={index}>
                  <Heading as="h3" size="5" className="mb-2">{option.title}</Heading>
                  <Text variant="muted" className="mb-4">
                    {option.description}
                  </Text>
                  <Button asChild={option.isExternal} variant={index === 0 ? "default" : "outline"}>
                    {option.isExternal ? (
                      <a href={option.buttonLink}>{option.buttonText}</a>
                    ) : (
                      <span>{option.buttonText}</span>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </section>
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
