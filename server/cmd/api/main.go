package main

import (
	"github.com/Satishcg12/CentralAuthV2/server/internal"
	"github.com/Satishcg12/CentralAuthV2/server/internal/config"
)

func main() {
	// Load configuration
	cfg := config.NewConfig()

	// Initialize server
	srv := internal.InitializeServer(cfg)

	// Set up routes
	internal.SetupRoutes(srv.Echo, srv.Store, cfg)

	// Start server and get quit channel
	quit := srv.StartServer()

	// Gracefully shutdown when signal received
	srv.ShutdownServer(quit)
}
