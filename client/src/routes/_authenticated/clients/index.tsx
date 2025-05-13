import { createFileRoute } from '@tanstack/react-router';
import { useGetAllClients, useDeleteClient } from '@/api/client/client.query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading, Paragraph, Text } from '@/components/ui/typography';
import { Link } from '@tanstack/react-router';
import { ClipboardCopy, Plus, Settings, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ClientResponse } from '@/api/client/client.dao';
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

export const Route = createFileRoute('/_authenticated/clients/')({
  component: ClientListPage,
});

function ClientListPage() {
  const { data, isLoading, isError } = useGetAllClients();
  const deleteClient = useDeleteClient();
  const [clientToDelete, setClientToDelete] = useState<ClientResponse | null>(null);

  const columns: ColumnDef<ClientResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Text className="font-medium">{row.original.name}</Text>
          <Text className="text-muted-foreground text-xs">{row.original.client_id}</Text>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <Text className="truncate max-w-[300px]">{row.original.description || 'No description'}</Text>
      ),
    },
    {
      accessorKey: 'redirect_uri',
      header: 'Redirect URI',
      cell: ({ row }) => (
        <Text className="truncate max-w-[250px]">{row.original.redirect_uri}</Text>
      ),
    },
    {
      accessorKey: 'is_public',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant={row.original.is_public ? "default" : "secondary"}>
          {row.original.is_public ? 'Public' : 'Confidential'}
        </Badge>
      ),
    },
    {
      accessorKey: 'oidc_enabled',
      header: 'OIDC',
      cell: ({ row }) => (
        <Badge variant={row.original.oidc_enabled ? "default" : "outline"}>
          {row.original.oidc_enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/clients/$clientId" params={{ clientId: row.original.id.toString() }}>
                  <Settings className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(row.original.client_id);
                  toast.info('Client ID copied to clipboard');
                }}
              >
                <ClipboardCopy className="mr-2 h-4 w-4" />
                Copy Client ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setClientToDelete(row.original)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClient.mutateAsync(clientToDelete.id.toString());
      setClientToDelete(null);
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  return (
    <div className="container mx-auto">
      <Header title='Clients' description='Manage OAuth clients for API integrations'>
        <Button asChild>
          <Link to="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </Header>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            View and manage all registered OAuth clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError ? (
            <div className="text-center py-6">
              <Text className="text-destructive">Failed to load clients</Text>
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : data?.data?.clients && data.data.clients.length > 0 ? (
            <DataTable columns={columns} data={data.data.clients} />
          ) : (
            <div className="text-center py-8">
              <Text className="text-muted-foreground mb-2">No clients found</Text>
              <Button asChild>
                <Link to="/clients/new">Create your first client</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the client "{clientToDelete?.name}" and revoke all access.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteClient}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
