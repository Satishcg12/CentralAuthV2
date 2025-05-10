import { createFileRoute, HeadContent } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Heading, Paragraph, Text } from "@/components/ui/typography";
import { APP_NAME, APP_VERSION } from "@/utils/config";
import { useAuthStore } from "@/stores/useAuthStore";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [{
			title: APP_NAME,
		}]
	}),
	component: App,
});

function App() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const user = useAuthStore((state) => state.user);

	return (
		<div className="container mx-auto px-4 py-12 max-w-5xl">
			<HeadContent />
			<header className="flex justify-between items-center mb-12">
				<div className="flex items-center gap-3">
					<Logo />
					<Text as="span" weight="bold" size="xl">{APP_NAME}</Text>
					<span className="text-sm text-muted-foreground">{APP_VERSION}</span>
				</div>
				<div className="flex items-center gap-4">
					{isAuthenticated && user && (
						<div className="flex items-center gap-2 text-sm">
							<span className="text-muted-foreground">Welcome,</span>
							<Text as="span" weight="semibold" className="capitalize">{(user.first_name + ' ' + user.last_name) || user.email}</Text>
						</div>
					)}
					<ModeToggle />
				</div>
			</header>

			<main>
				<section className="text-center mb-16">
					<Heading as="h1" size="1" className="mb-4">Welcome to {APP_NAME}</Heading>
					<Paragraph size="xl" className="text-muted-foreground mb-8 max-w-2xl mx-auto">
						Your secure authentication and authorization solution. Manage users, roles,
						and permissions with ease.
					</Paragraph>
					<div className="flex gap-4 justify-center">
						{isAuthenticated ? (
							<>
								<Button asChild size="lg">
									<Link to="/dashboard">Go to Dashboard</Link>
								</Button>
								<Button asChild variant="outline" size="lg">
									<Link to="/profile">Profile Settings</Link>
								</Button>
							</>
						) : (
							<>
								<Button asChild size="lg">
									<Link to="/login">Sign In</Link>
								</Button>
								<Button asChild variant="outline" size="lg">
									<Link to="/register">Create Account</Link>
								</Button>
							</>
						)}
					</div>
				</section>

				{isAuthenticated && user && (
					<section className="mb-16">
						<Card className="p-6">
							<Heading as="h2" size="3" className="mb-4">Account Overview</Heading>
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<Text as="p" weight="medium" className="text-muted-foreground mb-1">Email</Text>
									<Text>{user.email}</Text>
								</div>
								{user.first_name && user.last_name && (
									<div>
										<Text as="p" weight="medium" className="text-muted-foreground mb-1">Name</Text>
										<Text className="capitalize">{user.first_name + ' ' + user.last_name}</Text>
									</div>
								)}
								{user.roles && (
									<div>
										<Text as="p" weight="medium" className="text-muted-foreground mb-1">Roles</Text>
										<Text>{user.roles.join(', ')}</Text>
									</div>
								)}
								<div>
									<Text as="p" weight="medium" className="text-muted-foreground mb-1">Account Status</Text>
									<Text className="text-green-500">Active</Text>
								</div>
							</div>
						</Card>
					</section>
				)}

				<section className="grid md:grid-cols-3 gap-6 mb-12">
					{features.map((feature, index) => (
						<Card key={index} className="p-6">
							<div className="mb-4 text-primary">{feature.icon}</div>
							<Heading as="h3" size="4" className="mb-2">{feature.title}</Heading>
							<Paragraph className="text-muted-foreground">{feature.description}</Paragraph>
						</Card>
					))}
				</section>
			</main>

			<footer className="text-center text-muted-foreground mt-16 pt-8 border-t">
				<Paragraph>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</Paragraph>
				<div className="flex gap-4 justify-center mt-2">
					<Link to="/terms" className="text-sm hover:underline">Terms</Link>
					<Link to="/privacy" className="text-sm hover:underline">Privacy</Link>
					<Link to="/help" className="text-sm hover:underline">Help</Link>
				</div>
			</footer>
		</div>
	);
}

// Feature highlights with placeholder icons
const features = [
	{
		title: "Secure Authentication",
		description: "Industry-standard security protocols to keep your users' data safe and secure.",
		icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
	},
	{
		title: "Role Management",
		description: "Define custom roles and permissions to control access across your application.",
		icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
	},
	{
		title: "API Integration",
		description: "Easy to integrate with your existing services via our comprehensive REST API.",
		icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 22h-2" /><path d="M20 15v2a5 5 0 0 0 0 10" /><path d="M4 15v2a5 5 0 0 1 0 10" /><path d="M4 22h2" /><path d="M12 17v4" /><path d="M9 9h6" /><path d="M10 17h4" /><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>,
	},
];
