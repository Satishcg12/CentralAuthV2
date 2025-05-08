package db

import (
	"database/sql"
	"fmt"
	"log"
	"path/filepath"
	"runtime"

	"github.com/Satishcg12/CentralAuthV2/server/internal/db/sqlc"
	_ "github.com/lib/pq"
	"github.com/pressly/goose/v3"
)

// Config contains database connection parameters
type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// Store provides database access to the application
type Store struct {
	*sqlc.Queries
	db *sql.DB
}

// NewStore creates a new database store
func NewStore(db *sql.DB) *Store {
	return &Store{
		db:      db,
		Queries: sqlc.New(db),
	}
}

// GetDB returns the underlying database connection
func (s *Store) GetDB() *sql.DB {
	return s.db
}

// Connect establishes a database connection
func Connect(config Config) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DBName, config.SSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

// Close closes the database connection
func Close(db *sql.DB) error {
	return db.Close()
}

// RunMigrations runs database migrations using Goose
func RunMigrations(db *sql.DB) error {
	// Get the project root directory
	_, b, _, _ := runtime.Caller(0)
	basePath := filepath.Join(filepath.Dir(b), "..")

	// Path to migration files
	migrationsPath := filepath.Join(basePath, "db", "migrations")

	log.Printf("Running database migrations from %s", migrationsPath)

	// Set the database connection for Goose
	goose.SetDialect("postgres")

	// Run the migrations
	if err := goose.Up(db, migrationsPath); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}
