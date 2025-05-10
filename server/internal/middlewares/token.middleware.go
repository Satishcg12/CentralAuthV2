package middlewares

import (
	"github.com/Satishcg12/CentralAuthV2/server/internal/utils"
	"github.com/labstack/echo/v4"
)

// TokenLoaderMiddleware extracts both access and refresh tokens from the request
// and puts them in the Echo context for easier access in handlers
func (m *Middleware) TokenLoaderMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Extract access token from Authorization header or cookies
			accessToken := utils.GetTokenFromRequest(c)
			if accessToken != "" {
				c.Set("access_token", accessToken)

				// Validate the access token and extract claims if possible
				claims, err := utils.ValidateToken(accessToken)
				if err == nil && claims != nil {
					c.Set("access_token_claims", claims)
				}
			}

			// Extract refresh token from cookies, form data, or JSON body
			refreshToken := ""
			refreshTokenCookie, err := c.Cookie("refresh_token")
			if err == nil && refreshTokenCookie != nil {
				refreshToken = refreshTokenCookie.Value
			}

			// If not found in cookie, check request body (form data)
			if refreshToken == "" {
				refreshToken = c.FormValue("refresh_token")
			}

			c.Set("refresh_token", refreshToken)

			return next(c)
		}
	}
}

// ValidateAccessTokenMiddleware validates the access token from context
// and sets userid, authenticated, and auth_error in the context
// This middleware doesn't block requests without valid tokens, it just sets authentication info
func (m *Middleware) ValidateAccessTokenMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Default to unauthenticated
			c.Set("authenticated", false)

			// Get token from context (previously set by TokenLoaderMiddleware)
			accessToken, ok := c.Get("access_token").(string)
			if !ok || accessToken == "" {
				c.Set("auth_error", "No access token provided")
				return next(c)
			}

			// Validate the token using the utility function
			claims, err := utils.ValidateToken(accessToken)
			if err != nil {
				// Invalid token
				c.Set("auth_error", err.Error())
				return next(c)
			}

			// Token is valid - set authentication data in context
			c.Set("user_id", claims.UserID)
			c.Set("authenticated", true)

			// Clear any auth errors
			c.Set("auth_error", "")

			return next(c)
		}
	}
}
