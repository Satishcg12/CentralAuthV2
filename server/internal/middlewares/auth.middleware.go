package middlewares

import (
	"net/http"

	"github.com/Satishcg12/CentralAuthV2/server/internal/utils"
	"github.com/labstack/echo/v4"
)

// RequireAuthMiddleware is a middleware that blocks requests from unauthenticated users
// It requires TokenLoaderMiddleware and ValidateAccessTokenMiddleware to be executed before this middleware
func (m *Middleware) RequireAuthMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Check if user is authenticated
			authenticated, ok := c.Get("authenticated").(bool)
			if !ok || !authenticated {
				// Get auth error from context if available
				authError, _ := c.Get("auth_error").(string)
				if authError == "" {
					authError = "Authentication required"
				}

				return utils.RespondWithError(
					c,
					http.StatusUnauthorized,
					"Authentication required",
					utils.ErrorCodeUnauthorized,
					authError,
					nil,
				)
			}

			// User is authenticated, proceed to the next handler
			return next(c)
		}
	}
}
