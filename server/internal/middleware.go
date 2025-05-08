package internal

import (
	"net/http"

	"github.com/Satishcg12/CentralAuthV2/server/internal/config"
	middleware "github.com/Satishcg12/CentralAuthV2/server/internal/middlewares"
	"github.com/labstack/echo/v4"
	emiddleware "github.com/labstack/echo/v4/middleware"
)

func SetupGlobalMiddleware(e *echo.Echo, cfg *config.Config) {

	// Add CORS middleware
	e.Use(emiddleware.CORSWithConfig(emiddleware.CORSConfig{
		AllowOrigins:     []string{cfg.ClientURL},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
		MaxAge:           86400, // 24 hours
	}))

	// Add other middleware
	e.Use(emiddleware.LoggerWithConfig(emiddleware.LoggerConfig{

		Format: "method=${method}, uri=${uri}, status=${status} \nmessage=${error}\n",
	}))
	e.Use(emiddleware.Recover())

	// Add validation middleware
	e.Use(middleware.ValidationMiddleware())

	// Add JWT validation middleware
	e.Use(middleware.ValidateJWT())

}
