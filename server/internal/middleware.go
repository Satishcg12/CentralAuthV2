package internal

import (
	"net/http"

	"github.com/Satishcg12/CentralAuthV2/server/internal/config"
	"github.com/Satishcg12/CentralAuthV2/server/internal/middlewares"
	middleware "github.com/Satishcg12/CentralAuthV2/server/internal/middlewares"
	"github.com/labstack/echo/v4"
	emiddleware "github.com/labstack/echo/v4/middleware"
)

func SetupGlobalMiddleware(e *echo.Echo, cfg *config.Config, cm middlewares.IMiddleware) {

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

	// This middleware extracts both access and refresh tokens and puts them in the context
	e.Use(cm.TokenLoaderMiddleware())

	// // Add access token validation middleware
	e.Use(cm.ValidateAccessTokenMiddleware())

}
