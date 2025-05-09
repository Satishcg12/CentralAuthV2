import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";


import TanstackQueryLayout from "../integrations/tanstack-query/layout";

import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import NotFoundError from "@/components/errors/not-found-error";
import GeneralError from "@/components/errors/general-error";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	notFoundComponent: NotFoundError,
	errorComponent: GeneralError,

	component: () => (
		<>

			<Outlet />
			<Toaster />

			<TanStackRouterDevtools />
			<TanstackQueryLayout />
		</>
	),
});
