import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "./client.api";
import { toast } from "sonner";
import type { CreateClientRequest, UpdateClientRequest } from "./client.dao";

// Query key constants
export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

// Hook to get all clients
export const useGetAllClients = () => {
  return useQuery({
    queryKey: clientKeys.lists(),
    queryFn: clientApi.getAll,
  });
};

// Hook to get a specific client by ID
export const useGetClientById = (id: string) => {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientApi.getById(id),
    enabled: !!id,
  });
};

// Hook to create a new client
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateClientRequest) => clientApi.create(data),
    onSuccess: (_data) => {
      // Invalidate the clients list query to refetch
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success("Client created successfully");
    },
    onError: (error) => {
      console.error("Client creation error:", error);
      toast.error("Failed to create client");
    },
  });
};

// Hook to update a client
export const useUpdateClient = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateClientRequest) => clientApi.update(id, data),
    onSuccess: (_data) => {
      // Invalidate specific client and the list
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success("Client updated successfully");
    },
    onError: (error) => {
      console.error("Client update error:", error);
      toast.error("Failed to update client");
    },
  });
};

// Hook to delete a client
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientApi.delete(id),
    onSuccess: (_data, variables) => {
      // Invalidate the clients list query
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      // Remove the deleted client from the cache
      queryClient.removeQueries({ queryKey: clientKeys.detail(variables) });
      toast.success("Client deleted successfully");
    },
    onError: (error) => {
      console.error("Client deletion error:", error);
      toast.error("Failed to delete client");
    },
  });
};

// Hook to regenerate a client secret
export const useRegenerateClientSecret = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => clientApi.regenerateSecret(id),
    onSuccess: (_data) => {
      // Invalidate the specific client query
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
      toast.success("Client secret regenerated successfully");
    },
    onError: (error) => {
      console.error("Client secret regeneration error:", error);
      toast.error("Failed to regenerate client secret");
    },
  });
};

// Hook to regenerate a client secret using client_id
export const useRegenerateClientSecretByClientID = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clientId: string) => clientApi.regenerateSecretByClientID(clientId),
    onSuccess: (_data) => {
      // After regeneration, we don't need to invalidate queries as this is likely used in a recovery flow
      toast.success("Client secret regenerated successfully");
    },
    onError: (error) => {
      console.error("Client secret regeneration error:", error);
      toast.error("Failed to regenerate client secret");
    },
  });
};