package middlewares

import (
	"net/http"

	"github.com/Satishcg12/CentralAuthV2/server/internal/utils"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

// ValidationMiddleware returns a middleware that handles validation errors
func ValidationMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Set the validator to the context if not already set
			if c.Echo().Validator == nil {
				c.Echo().Validator = utils.NewValidator()
			}
			// Continue with the next middleware or handler
			if err := next(c); err != nil {
				// If it's a validation error (HTTP error with validation info)
				if he, ok := err.(*echo.HTTPError); ok && he.Code == http.StatusBadRequest {
					// Check if the error is from the validator
					if validationErrs, ok := he.Internal.(validator.ValidationErrors); ok {
						// Format the validation errors using the utility function
						validationErrors := utils.FormatValidationErrors(validationErrs)

						// Return a standardized validation error response
						return utils.RespondWithError(
							c,
							utils.StatusCodeBadRequest,
							"Validation failed",
							utils.ErrorCodeValidationFailed,
							"Input validation failed",
							validationErrors,
						)
					}
				}

				// For other types of errors, pass them through
				return err
			}

			return nil
		}
	}
}

// ValidateJWT middleware checks for a valid JWT token in the Authorization header
// It doesn't immediately reject the request but instead attaches authentication info to the context
func ValidateJWT() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Get the token from the request
			token := utils.GetTokenFromRequest(c)
			// If token is present, try to validate it
			if token != "" {
				// Verify the token and get the claims
				userID, err := utils.GetUserIDFromAccessToken(token)
				if err == nil {
					// Token is valid, store user ID in context
					c.Set("user_id", userID)
					c.Set("authenticated", true)
				} else {
					// Invalid token, but don't block the request yet
					// We'll let the RequireAuth middleware handle that if needed
					c.Set("authenticated", false)
					c.Set("auth_error", err.Error())
				}
			} else {
				// No token found
				c.Set("authenticated", false)
			}

			return next(c)
		}
	}
}

// // RequireAuth middleware checks if the user is authenticated
// // This should be used after ValidateJWT middleware
// func RequireAuth() echo.MiddlewareFunc {
// 	return func(next echo.HandlerFunc) echo.HandlerFunc {
// 		return func(c echo.Context) error {
// 			authenticated, ok := c.Get("authenticated").(bool)

// 			// If not authenticated or not set, return unauthorized
// 			if !ok || !authenticated {
// 				errorMessage := "Authentication required"
// 				if authError, ok := c.Get("auth_error").(string); ok && authError != "" {
// 					errorMessage = authError
// 				}

// 				return utils.RespondWithError(
// 					c,
// 					utils.StatusCodeUnauthorized,
// 					"Unauthorized",
// 					utils.ErrorCodeUnauthorized,
// 					errorMessage,
// 					nil,
// 				)
// 			}

// 			return next(c)
// 		}
// 	}
// }

// // RequirePermission middleware checks if the user has the required permission
// // This should be used after RequireAuth middleware
// func RequirePermission(permissionName string) echo.MiddlewareFunc {
// 	return func(next echo.HandlerFunc) echo.HandlerFunc {
// 		return func(c echo.Context) error {
// 			// Get user ID from context (set by ValidateJWT)
// 			userID, ok := c.Get("user_id").(int64)
// 			if !ok {
// 				return utils.RespondWithError(
// 					c,
// 					utils.StatusCodeUnauthorized,
// 					"Unauthorized",
// 					utils.ErrorCodeUnauthorized,
// 					"User authentication required",
// 					nil,
// 				)
// 			}

// 			// Check if user has the required permission or "all" permission
// 			hasPermission, err := checkUserPermission(c, userID, permissionName)
// 			if err != nil {
// 				return utils.RespondWithError(
// 					c,
// 					utils.StatusCodeInternalError,
// 					"Failed to check permissions",
// 					utils.ErrorCodeInternalError,
// 					"Error checking user permissions",
// 					nil,
// 				)
// 			}

// 			// If no direct permission, check for "all" permission
// 			if !hasPermission {
// 				hasAllPermission, err := checkUserPermission(c, userID, "all")
// 				if err != nil {
// 					return utils.RespondWithError(
// 						c,
// 						utils.StatusCodeInternalError,
// 						"Failed to check permissions",
// 						utils.ErrorCodeInternalError,
// 						"Error checking user permissions",
// 						nil,
// 					)
// 				}
// 				hasPermission = hasAllPermission
// 			}

// 			// Return a forbidden error if the user doesn't have permission
// 			if !hasPermission {
// 				return utils.RespondWithError(
// 					c,
// 					utils.StatusCodeForbidden,
// 					"Forbidden",
// 					utils.ErrorCodeForbidden,
// 					fmt.Sprintf("You don't have the required permission: %s", permissionName),
// 					nil,
// 				)
// 			}

// 			return next(c)
// 		}
// 	}
// }

// // Placeholder function for checking permissions - this would be replaced with a real implementation
// func checkUserPermission(c echo.Context, userID int64, permissionName string) (bool, error) {
// 	// Get the database store from the context
// 	store, ok := c.Get("store").(*db.Store)
// 	if !ok {
// 		return false, fmt.Errorf("database store not found in context")
// 	}

// 	// Check if the user has the specified permission

// 	hasPermission, err := store.CheckUserHasPermission(
// 		c.Request().Context(),
// 		sqlc.CheckUserHasPermissionParams{
// 			UserID: int32(userID),
// 			Name:   permissionName,
// 		},
// 	)

// 	if err != nil {
// 		return false, err
// 	}

// 	return hasPermission, nil
// }
