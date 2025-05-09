package internal

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/Satishcg12/CentralAuthV2/server/internal/config"
	"github.com/Satishcg12/CentralAuthV2/server/internal/db"
	"github.com/Satishcg12/CentralAuthV2/server/internal/utils"
	"github.com/labstack/echo/v4"
)

// Server represents the HTTP server
type Server struct {
	Echo   *echo.Echo
	Config *config.Config
	Server *http.Server
	Store  *db.Store
}

// InitializeServer creates and configures a new server instance
func InitializeServer(cfg *config.Config) *Server {
	e := echo.New()
	e.HideBanner = false

	// Set up the validator using the one defined in utils package
	e.Validator = utils.NewValidator()

	// Initialize JWT configuration
	utils.InitJWT(cfg.JWT)

	// Connect to database
	database, err := db.Connect(cfg.DB)
	if err != nil {
		log.Printf("Failed to connect to database: %v", err)
		return &Server{Config: cfg}
	}

	// Run database migrations
	if err := db.RunMigrations(database); err != nil {
		log.Printf("Warning: Failed to run migrations: %v", err)
		// Continue server startup even if migrations fail
	}

	// Create store
	store := db.NewStore(database)

	// Add store to context
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set("store", store)
			return next(c)
		}
	})

	// Define server parameters
	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.ServerPort),
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
	}

	return &Server{
		Echo:   e,
		Config: cfg,
		Server: server,
		Store:  store,
	}
}

// StartServer starts the HTTP server in a goroutine and returns a channel that
// will receive a signal when the server is to be shut down
func (s *Server) StartServer() chan os.Signal {
	// Start server
	go func() {
		if err := s.Echo.StartServer(s.Server); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error starting server: %v", err)
		}
	}()

	log.Printf("Server started on port %s", s.Config.ServerPort)

	// Set up channel for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	return quit
}

// ShutdownServer gracefully shuts down the server with a timeout
func (s *Server) ShutdownServer(quit chan os.Signal) {
	// Wait for interrupt signal
	<-quit

	// Shutdown gracefully with a timeout
	ctx, cancel := context.WithTimeout(context.Background(), s.Config.ShutdownPeriod)
	defer cancel()
	if err := s.Echo.Shutdown(ctx); err != nil {
		log.Fatalf("Error during server shutdown: %v", err)
	}
	log.Println("Server shutdown complete")
}
