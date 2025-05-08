package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/Satishcg12/CentralAuthV2/server/internal/db"
	"github.com/joho/godotenv"
)

// Config represents server configuration
type Config struct {
	ServerPort     string
	ReadTimeout    time.Duration
	WriteTimeout   time.Duration
	ShutdownPeriod time.Duration
	ClientURL      string // URL of the client application for CORS
	DB             db.Config
	JWT            JWTConfig
	AdminEmail     string // Email address that automatically gets admin role and permissions
}

// JWTConfig holds JWT related configuration
type JWTConfig struct {
	Secret        string
	ExpiryHours   int
	RefreshSecret string
	RefreshHours  int
}

// NewConfig creates a new configuration with default values or from environment variables
func NewConfig() *Config {
	// Load .env file if it exists
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using default environment variables")
		// Handle error if needed
	}

	// Default values
	config := &Config{
		ServerPort:     "8080",
		ReadTimeout:    5 * time.Minute,
		WriteTimeout:   5 * time.Minute,
		ShutdownPeriod: 10 * time.Second,
		ClientURL:      "http://localhost:5173", // Default client URL
		AdminEmail:     "satish@gmail.com",      // Default admin email
		DB: db.Config{
			Host:     "localhost",
			Port:     5432,
			User:     "postgres",
			Password: "postgres",
			DBName:   "centralauth",
			SSLMode:  "disable",
		},
		JWT: JWTConfig{
			Secret:        "your-secret-key-change-in-production",
			ExpiryHours:   24, // 1 day
			RefreshSecret: "your-refresh-secret-key-change-in-production",
			RefreshHours:  168, // 7 days
		},
	}

	// Override with environment variables if present
	if port := os.Getenv("SERVER_PORT"); port != "" {
		config.ServerPort = port
	}

	if readTimeout := getEnvAsDuration("READ_TIMEOUT", 5*time.Minute); readTimeout != 0 {
		config.ReadTimeout = readTimeout
	}

	if writeTimeout := getEnvAsDuration("WRITE_TIMEOUT", 5*time.Minute); writeTimeout != 0 {
		config.WriteTimeout = writeTimeout
	}

	if shutdownPeriod := getEnvAsDuration("SHUTDOWN_PERIOD", 10*time.Second); shutdownPeriod != 0 {
		config.ShutdownPeriod = shutdownPeriod
	}

	if clientURL := os.Getenv("CLIENT_URL"); clientURL != "" {
		config.ClientURL = clientURL
	}

	// Admin email from environment
	if adminEmail := os.Getenv("ADMIN_EMAIL"); adminEmail != "" {
		config.AdminEmail = adminEmail
	}

	// Database config from environment
	if dbHost := os.Getenv("DB_HOST"); dbHost != "" {
		config.DB.Host = dbHost
	}

	if dbPort := getEnvAsInt("DB_PORT", 5432); dbPort != 0 {
		config.DB.Port = dbPort
	}

	if dbUser := os.Getenv("DB_USER"); dbUser != "" {
		config.DB.User = dbUser
	}

	if dbPassword := os.Getenv("DB_PASSWORD"); dbPassword != "" {
		config.DB.Password = dbPassword
	}

	if dbName := os.Getenv("DB_NAME"); dbName != "" {
		config.DB.DBName = dbName
	}

	if dbSSLMode := os.Getenv("DB_SSLMODE"); dbSSLMode != "" {
		config.DB.SSLMode = dbSSLMode
	}

	// JWT config from environment
	if jwtSecret := os.Getenv("JWT_SECRET"); jwtSecret != "" {
		config.JWT.Secret = jwtSecret
	}

	if jwtExpiry := getEnvAsInt("JWT_EXPIRY_HOURS", 24); jwtExpiry != 0 {
		config.JWT.ExpiryHours = jwtExpiry
	}

	if jwtRefreshSecret := os.Getenv("JWT_REFRESH_SECRET"); jwtRefreshSecret != "" {
		config.JWT.RefreshSecret = jwtRefreshSecret
	}

	if jwtRefreshHours := getEnvAsInt("JWT_REFRESH_HOURS", 168); jwtRefreshHours != 0 {
		config.JWT.RefreshHours = jwtRefreshHours
	}

	return config
}

// getEnvAsDuration tries to parse an environment variable as a duration
func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	if value, exists := os.LookupEnv(key); exists {
		if intVal, err := strconv.Atoi(value); err == nil {
			return time.Duration(intVal) * time.Second
		}
	}
	return defaultValue
}

// getEnvAsInt tries to parse an environment variable as an integer
func getEnvAsInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}
