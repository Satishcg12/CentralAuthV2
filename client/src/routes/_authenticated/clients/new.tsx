import { useCreateClient } from '@/api/client/client.query';
import Header from '@/components/Header';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

export const Route = createFileRoute('/_authenticated/clients/new')({
  component: CreateClientPage,
});

const clientFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  website: z.string().url('Please enter a valid URL').max(255, 'Website URL cannot exceed 255 characters').optional().or(z.literal('')),
  redirect_uri: z.string().url('Please enter a valid redirect URI').max(255, 'Redirect URI cannot exceed 255 characters'),
  is_public: z.boolean(),
  oidc_enabled: z.boolean().default(false),
  allowed_scopes: z.array(z.string()).default([]),
  allowed_grant_types: z.array(z.string()).default([]),
  allowed_response_types: z.array(z.string()).default([]),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

function CreateClientPage() {
  const createClient = useCreateClient();
  const navigate = useNavigate();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as Resolver<ClientFormValues>,
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
  });

  const onSubmit = async (values: ClientFormValues) => {
    try {
      const result = await createClient.mutateAsync({
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

      if (result?.data) {
        // Show the client secret in a toast with a copy button
        toast.success('Client created successfully', {
          description: (
            <div className="mt-2">
              <p className="mb-2 font-medium">Please save your client secret. It will only be shown once:</p>
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
                Copy to clipboard
              </Button>
            </div>
          ),
          duration: 15000,
        });

        // Navigate to the client details page
        navigate({ to: `/clients/${result.data.id}` });
      }
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      
      <Header title="Create Client" description="Register a new OAuth client" beforeTitle={
        <Button variant="outline" size="icon" asChild className="mr-4">
          <Link to="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      } />

      <Card>
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
          <CardDescription>
            Enter the required information for your OAuth client
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

              <FormField
                control={form.control}
                name="oidc_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable OpenID Connect
                      </FormLabel>
                      <FormDescription>
                        Allow this client to use OpenID Connect (OIDC) for authentication
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

              {/* OIDC fields - only show when OIDC is enabled */}
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

              <div className="flex justify-end">
                <Button type="submit" disabled={createClient.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Create Client
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Note: Client secrets are only shown once during creation. Keep it secure!
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}