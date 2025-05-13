import { useGetClientById, useRegenerateClientSecret, useUpdateClient } from '@/api/client/client.query';
import Header from '@/components/Header';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Heading, Text } from '@/components/ui/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ClipboardCopy, KeyRound, Save } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

export const Route = createFileRoute('/_authenticated/clients/$clientId')({
    component: ClientDetailPage,
});

const clientFormSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name cannot exceed 100 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    website: z.string().url('Please enter a valid URL').max(255, 'Website URL cannot exceed 255 characters').optional().or(z.literal('')),
    redirect_uri: z.string().url('Please enter a valid redirect URI').max(255, 'Redirect URI cannot exceed 255 characters'),
    is_public: z.boolean(),
    oidc_enabled: z.boolean(),
    allowed_scopes: z.array(z.string()),
    allowed_grant_types: z.array(z.string()),
    allowed_response_types: z.array(z.string()),
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
            oidc_enabled: false,
            allowed_scopes: [],
            allowed_grant_types: [],
            allowed_response_types: [],
        },
        values: data?.data ? {
            name: data.data.name,
            description: data.data.description || '',
            website: data.data.website || '',
            redirect_uri: data.data.redirect_uri,
            is_public: data.data.is_public,
            oidc_enabled: data.data.oidc_enabled,
            allowed_scopes: data.data.allowed_scopes || [],
            allowed_grant_types: data.data.allowed_grant_types || [],
            allowed_response_types: data.data.allowed_response_types || [],
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
                oidc_enabled: values.oidc_enabled,
                allowed_scopes: values.allowed_scopes,
                allowed_grant_types: values.allowed_grant_types,
                allowed_response_types: values.allowed_response_types,
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

                                    <Separator className="my-6" />
                                    
                                    <div className="space-y-4">
                                        <Heading as="h4">OpenID Connect Settings</Heading>

                                        <FormField
                                            control={form.control}
                                            name="oidc_enabled"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">
                                                            Enable OIDC
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Enable OpenID Connect functionality for this client
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
                                        
                                        {form.watch("oidc_enabled") && (
                                            <div className="space-y-6 border rounded-lg p-4 bg-muted/30">
                                                <h3 className="font-medium">OpenID Connect Settings</h3>
                                                
                                                {/* Scopes */}
                                                <FormField
                                                    control={form.control}
                                                    name="allowed_scopes"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Allowed Scopes</FormLabel>
                                                            <div className="grid gap-1.5">
                                                                <div className="flex flex-wrap gap-1 mb-2">
                                                                    {field.value.map((scope) => (
                                                                        <div key={scope} className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                                                                            {scope}
                                                                            <button
                                                                                type="button"
                                                                                className="ml-1 text-muted-foreground hover:text-foreground"
                                                                                onClick={() => field.onChange(field.value.filter((s) => s !== scope))}
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                    {field.value.length === 0 && (
                                                                        <div className="text-xs text-muted-foreground italic">No scopes selected</div>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {[
                                                                        { id: "openid", label: "OpenID Connect" },
                                                                        { id: "profile", label: "Profile info" },
                                                                        { id: "email", label: "Email address" },
                                                                        { id: "address", label: "Physical address" },
                                                                        { id: "phone", label: "Phone number" },
                                                                        { id: "offline_access", label: "Refresh tokens" },
                                                                    ].map((scope) => (
                                                                        <div key={scope.id} className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`scope-${scope.id}`}
                                                                                checked={field.value.includes(scope.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    if (checked) {
                                                                                        field.onChange([...field.value, scope.id]);
                                                                                    } else {
                                                                                        field.onChange(field.value.filter((s) => s !== scope.id));
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <label htmlFor={`scope-${scope.id}`} className="text-sm">
                                                                                {scope.label}
                                                                            </label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                
                                                                <div className="flex mt-2">
                                                                    <Input 
                                                                        placeholder="Add custom scope..."
                                                                        className="text-sm"
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                const customScope = e.currentTarget.value.trim();
                                                                                if (customScope && !field.value.includes(customScope)) {
                                                                                    field.onChange([...field.value, customScope]);
                                                                                    e.currentTarget.value = '';
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {/* Grant Types */}
                                                    <FormField
                                                        control={form.control}
                                                        name="allowed_grant_types"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Allowed Grant Types</FormLabel>
                                                                <div className="space-y-1.5 border rounded-md p-2">
                                                                    {[
                                                                        { id: "authorization_code", label: "Authorization Code" },
                                                                        { id: "refresh_token", label: "Refresh Token" },
                                                                        { id: "client_credentials", label: "Client Credentials" },
                                                                        { id: "password", label: "Password" },
                                                                        { id: "implicit", label: "Implicit (legacy)" },
                                                                    ].map((grant) => (
                                                                        <div key={grant.id} className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`grant-${grant.id}`}
                                                                                checked={field.value.includes(grant.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    if (checked) {
                                                                                        field.onChange([...field.value, grant.id]);
                                                                                    } else {
                                                                                        field.onChange(field.value.filter((g) => g !== grant.id));
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <label htmlFor={`grant-${grant.id}`} className="text-sm">
                                                                                {grant.label}
                                                                            </label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    
                                                    {/* Response Types */}
                                                    <FormField
                                                        control={form.control}
                                                        name="allowed_response_types"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Allowed Response Types</FormLabel>
                                                                <div className="space-y-1.5 border rounded-md p-2">
                                                                    {[
                                                                        { id: "code", label: "Code" },
                                                                        { id: "token", label: "Token" },
                                                                        { id: "id_token", label: "ID Token" },
                                                                        { id: "id_token token", label: "ID Token + Token" },
                                                                        { id: "code id_token", label: "Code + ID Token" },
                                                                    ].map((type) => (
                                                                        <div key={type.id} className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`response-${type.id}`}
                                                                                checked={field.value.includes(type.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    if (checked) {
                                                                                        field.onChange([...field.value, type.id]);
                                                                                    } else {
                                                                                        field.onChange(field.value.filter((t) => t !== type.id));
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <label htmlFor={`response-${type.id}`} className="text-sm">
                                                                                {type.label}
                                                                            </label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                
                                                <div className="text-xs text-muted-foreground mt-2">
                                                    <p>Learn more about <a href="https://openid.net/specs/openid-connect-core-1_0.html" target="_blank" rel="noopener noreferrer" className="underline">OpenID Connect</a> configuration options.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

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

                            <Separator />
                            
                            <div>
                                <Text className="text-sm font-medium mb-1">OpenID Connect Status</Text>
                                <Badge variant={client.oidc_enabled ? "default" : "outline"} className="mb-2">
                                    {client.oidc_enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                                {client.oidc_enabled && (
                                    <div className="mt-4 space-y-3">
                                        {client.allowed_scopes.length > 0 && (
                                            <div>
                                                <Text className="text-xs font-medium">Allowed Scopes</Text>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {client.allowed_scopes.map((scope) => (
                                                        <Badge key={scope} variant="secondary" className="text-xs">
                                                            {scope}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {client.allowed_grant_types.length > 0 && (
                                            <div>
                                                <Text className="text-xs font-medium">Allowed Grant Types</Text>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {client.allowed_grant_types.map((type) => (
                                                        <Badge key={type} variant="secondary" className="text-xs">
                                                            {type}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {client.allowed_response_types.length > 0 && (
                                            <div>
                                                <Text className="text-xs font-medium">Allowed Response Types</Text>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {client.allowed_response_types.map((type) => (
                                                        <Badge key={type} variant="secondary" className="text-xs">
                                                            {type}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
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
