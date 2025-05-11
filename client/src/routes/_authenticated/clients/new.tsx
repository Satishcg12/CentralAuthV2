import { createFileRoute } from '@tanstack/react-router';
import { useCreateClient } from '@/api/client/client.query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Heading, Paragraph } from '@/components/ui/typography';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Save } from 'lucide-react';
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
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/clients/new')({
  component: CreateClientPage,
});

const clientFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  website: z.string().url('Please enter a valid URL').max(255, 'Website URL cannot exceed 255 characters').optional().or(z.literal('')),
  redirect_uri: z.string().url('Please enter a valid redirect URI').max(255, 'Redirect URI cannot exceed 255 characters'),
  is_public: z.boolean(), // Changed from z.boolean().default(false)
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

function CreateClientPage() {
  const createClient = useCreateClient();
  const navigate = useNavigate();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      description: '',
      website: '',
      redirect_uri: '',
      is_public: false, // Default value is set here instead
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
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" asChild className="mr-4">
          <Link to="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <Heading size="4" className="mb-1">Create New OAuth Client</Heading>
          <Paragraph className="text-muted-foreground">
            Register a new application to integrate with our API
          </Paragraph>
        </div>
      </div>

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