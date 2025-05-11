import { createFileRoute } from '@tanstack/react-router';
import { useGetClientById, useUpdateClient, useRegenerateClientSecret } from '@/api/client/client.query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Heading, Paragraph, Text } from '@/components/ui/typography';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ClipboardCopy, KeyRound, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import Header from '@/components/Header';

export const Route = createFileRoute('/_authenticated/clients/$clientId')({
    component: ClientDetailPage,
});

const clientFormSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name cannot exceed 100 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    website: z.string().url('Please enter a valid URL').max(255, 'Website URL cannot exceed 255 characters').optional().or(z.literal('')),
    redirect_uri: z.string().url('Please enter a valid redirect URI').max(255, 'Redirect URI cannot exceed 255 characters'),
    is_public: z.boolean(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

function ClientDetailPage() {
    const { clientId } = Route.useParams();
    const { data, isLoading, isError } = useGetClientById(clientId);
    const updateClient = useUpdateClient(clientId);
    const regenerateSecret = useRegenerateClientSecret(clientId);
    const navigate = useNavigate();
    const [isRegenerateSecretDialogOpen, setIsRegenerateSecretDialogOpen] = useState(false);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            name: '',
            description: '',
            website: '',
            redirect_uri: '',
            is_public: false,
        },
        values: data?.data ? {
            name: data.data.name,
            description: data.data.description || '',
            website: data.data.website || '',
            redirect_uri: data.data.redirect_uri,
            is_public: data.data.is_public,
        } : undefined,
    });

    const onSubmit = async (values: ClientFormValues) => {
        try {
            await updateClient.mutateAsync({
                name: values.name,
                description: values.description || '',
                website: values.website || '',
                redirect_uri: values.redirect_uri,
                is_public: values.is_public,
            });
        } catch (error) {
            console.error('Failed to update client:', error);
        }
    };

    const handleRegenerateSecret = async () => {
        try {
            const result = await regenerateSecret.mutateAsync();
            setIsRegenerateSecretDialogOpen(false);

            if (result?.data?.client_secret) {
                // Show the new secret in a toast with a copy button
                toast.success('Secret regenerated successfully', {
                    description: (
                        <div className="mt-2">
                            <div className="bg-muted p-2 rounded-md mb-2 font-mono text-xs break-all">
                                {result.data.client_secret}
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText(result.data?.client_secret ?? '');
                                    toast.info('Client secret copied to clipboard');
                                }}
                            >
                                <ClipboardCopy className="h-3 w-3 mr-1" /> Copy
                            </Button>
                        </div>
                    ),
                    duration: 10000,
                });
            }
        } catch (error) {
            console.error('Failed to regenerate client secret:', error);
        }
    };

    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text);
        toast.info(message);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4 mb-2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto py-6">
                <Card className="p-6 text-center">
                    <CardTitle className="mb-2">Error Loading Client</CardTitle>
                    <CardDescription className="mb-4">
                        We couldn't load the client details. Please try again.
                    </CardDescription>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" asChild>
                            <Link to="/clients">Back to Clients</Link>
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            Retry
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    if (!data?.data) {
        return (
            <div className="container mx-auto py-6">
                <Card className="p-6 text-center">
                    <CardTitle className="mb-2">Client Not Found</CardTitle>
                    <CardDescription className="mb-4">
                        The client you're looking for doesn't exist or you don't have permission to view it.
                    </CardDescription>
                    <Button asChild>
                        <Link to="/clients">Back to Clients</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const client = data.data;

    return (
        <div className="container mx-auto">
            <Header
                beforeTitle={
                    <Button variant="default" size="icon" className='size-7' asChild>
                        <Link to="/clients">
                            <ArrowLeft className="h-4 w-4 p-0" />
                        </Link>
                    </Button>
                }
                title={client.name}
                description={`Client ID: ${client.client_id}`}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(client.client_id, 'Client ID copied to clipboard')}
                >
                    <ClipboardCopy className="h-3 w-3" />
                </Button>

            </Header>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Details</CardTitle>
                            <CardDescription>
                                Edit your OAuth client application details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="My Application" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    The name of your application as shown to users
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe your application..."
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Brief description of your application
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="website"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Website URL</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://example.com" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Your application's homepage
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="redirect_uri"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Redirect URI</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://example.com/callback" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Where users will be redirected after authorization
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="is_public"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Public Client
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Public clients cannot securely store secrets. Use this for single-page or mobile apps.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={updateClient.isPending}>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Security</CardTitle>
                            <CardDescription>
                                Manage your client credentials
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Text className="text-sm font-medium mb-1">Client Type</Text>
                                <Badge variant={client.is_public ? "default" : "secondary"} className="mb-2">
                                    {client.is_public ? 'Public' : 'Confidential'}
                                </Badge>
                                <Text className="text-xs text-muted-foreground">
                                    {client.is_public
                                        ? 'Public clients do not use client secrets'
                                        : 'Confidential clients require a client secret for authentication'}
                                </Text>
                            </div>

                            {!client.is_public && (
                                <>
                                    <Separator />
                                    <div>
                                        <Text className="text-sm font-medium mb-2">Client Secret</Text>
                                        <Text className="text-xs text-muted-foreground mb-4">
                                            The client secret is only shown once when created or regenerated. Keep it secure.
                                        </Text>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsRegenerateSecretDialogOpen(true)}
                                            className="w-full"
                                        >
                                            <KeyRound className="mr-2 h-4 w-4" />
                                            Regenerate Secret
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="border-t pt-6 flex flex-col items-start">
                            <Text className="text-sm font-medium mb-1">Created</Text>
                            <Text className="text-sm text-muted-foreground mb-4">
                                {new Date(client.created_at).toLocaleString()}
                            </Text>
                            <Text className="text-sm font-medium mb-1">Last Updated</Text>
                            <Text className="text-sm text-muted-foreground">
                                {new Date(client.updated_at).toLocaleString()}
                            </Text>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <AlertDialog
                open={isRegenerateSecretDialogOpen}
                onOpenChange={setIsRegenerateSecretDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate Client Secret?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will invalidate the current client secret and generate a new one. Any applications using the current secret will need to be updated.
                            <br /><br />
                            <strong>This action cannot be undone.</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRegenerateSecret}>
                            Regenerate Secret
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
