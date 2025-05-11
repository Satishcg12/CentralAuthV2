import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading, Paragraph } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, ClipboardCopy, AlertCircle } from 'lucide-react';
import { useRegenerateClientSecretByClientID } from '@/api/client/client.query';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

export const Route = createFileRoute('/_authenticated/clients/recover-secret')({
  component: RecoverClientSecretPage,
});

function RecoverClientSecretPage() {
  const [clientId, setClientId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recoveredSecret, setRecoveredSecret] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const regenerateSecret = useRegenerateClientSecretByClientID();

  const handleClientIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientId(e.target.value);
  };

  const handleRecoverSecret = async () => {
    if (!clientId.trim()) {
      toast.error('Please enter a valid Client ID');
      return;
    }
    
    setIsDialogOpen(true);
  };

  const confirmRegeneration = async () => {
    try {
      const result = await regenerateSecret.mutateAsync(clientId);
      if (result?.data) {
        setRecoveredSecret(result.data.client_secret);
        setClientName(result.data.name);
      }
    } catch (error) {
      console.error('Failed to regenerate client secret:', error);
    } finally {
      setIsDialogOpen(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Client secret copied to clipboard');
  };

  return (
    <div className="container mx-auto py-10">
      <Heading size="4" className="mb-2">Recover Client Secret</Heading>
      <Paragraph className="text-muted-foreground mb-6">
        If you've lost your client secret, you can generate a new one using your client ID.
      </Paragraph>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Client Secret Recovery</CardTitle>
          <CardDescription>
            Enter your client ID to regenerate your client secret. Note that this will invalidate any previous secret.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="default" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Generating a new secret will invalidate the old one. Any applications using the current secret will need to be updated.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="client-id">Client ID</Label>
            <Input 
              id="client-id" 
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" 
              value={clientId} 
              onChange={handleClientIdChange}
            />
            <p className="text-sm text-muted-foreground">
              This is the UUID that was assigned when you created the client application.
            </p>
          </div>

          {recoveredSecret && (
            <div className="mt-6 p-4 border rounded-md bg-muted">
              <div className="mb-2">
                <span className="font-medium">Client Name:</span> {clientName}
              </div>
              <div className="mb-2 font-medium">New Client Secret:</div>
              <div className="p-3 bg-card rounded border font-mono text-xs break-all mb-2">
                {recoveredSecret}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(recoveredSecret)}
                className="mt-2"
              >
                <ClipboardCopy className="h-3 w-3 mr-2" /> Copy to clipboard
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Please save this secret somewhere safe. It will not be shown again.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleRecoverSecret} 
            disabled={!clientId.trim() || regenerateSecret.isPending}
            className="w-full"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            {regenerateSecret.isPending ? 'Recovering...' : 'Recover Client Secret'}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
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
            <AlertDialogAction onClick={confirmRegeneration}>
              Regenerate Secret
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
