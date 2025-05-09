package main

import (
	"github.com/Satishcg12/CentralAuthV2/server/internal"
	"github.com/Satishcg12/CentralAuthV2/server/internal/config"
	"github.com/Satishcg12/CentralAuthV2/server/internal/middlewares"
)

func main() {
	// Load configuration
	cfg := config.NewConfig()

	// Initialize server
	srv := internal.InitializeServer(cfg)
	cm := middlewares.NewMiddleware(middlewares.Middleware{
		Store:  srv.Store,
		Config: cfg,
	})

	// Set up global middleware
	internal.SetupGlobalMiddleware(srv.Echo, cfg, cm)

	// Set up routes
	internal.SetupRoutes(srv.Echo, srv.Store, cfg, cm)

	// Start server and get quit channel
	quit := srv.StartServer()

	// Gracefully shutdown when signal received
	srv.ShutdownServer(quit)
}
