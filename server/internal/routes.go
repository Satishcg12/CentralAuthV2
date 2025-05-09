package internal

import (
	"github.com/Satishcg12/CentralAuthV2/server/internal/config"
	"github.com/Satishcg12/CentralAuthV2/server/internal/db"
	"github.com/Satishcg12/CentralAuthV2/server/internal/domains"
	"github.com/Satishcg12/CentralAuthV2/server/internal/domains/auth"
	"github.com/Satishcg12/CentralAuthV2/server/internal/domains/health"
	"github.com/Satishcg12/CentralAuthV2/server/internal/middlewares"
	"github.com/labstack/echo/v4"
)

// setupRoutes configures all routes for the application
func SetupRoutes(e *echo.Echo, store *db.Store, cfg *config.Config, cm middlewares.IMiddleware) {

	ah := &domains.AppHandlers{
		Store: store,
		Cfg:   cfg,
	}

	// Create handlers
	authHandler := auth.NewAuthHandler(ah)
	// userHandler := handlers.NewUserHandler(ah)
	// roleHandler := handlers.NewRoleHandler(ah)
	// permissionHandler := handlers.NewPermissionHandler(ah)
	healthHandler := health.NewHealthHandler(ah)

	// API v1 group
	v1 := e.Group("/api/v1")

	// Health check - public
	v1.GET("/health", healthHandler.Check)

	// Auth routes - public
	auth := v1.Group("/auth")
	auth.POST("/register", authHandler.Register)
	auth.POST("/login", authHandler.Login)
	// auth.POST("/refresh", authHandler.RefreshToken)

	// Protected auth routes - require authentication
	authProtected := auth.Group("")
	authProtected.Use(cm.RequireAuthMiddleware())
	authProtected.POST("/logout", authHandler.Logout)
	// authProtected.POST("/logout-all", authHandler.LogoutAllSessions)
	// // sessions routes - require authentication
	// authProtected.GET("/sessions", authHandler.GetActiveSessions)
	// authProtected.GET("/sessions/:id", authHandler.GetSessionDetails)
	// authProtected.DELETE("/sessions/:id", authHandler.RevokeSession)
	// authProtected.PUT("/sessions/:id", authHandler.UpdateSessionName)
	// authProtected.GET("/sessions/filter", authHandler.FilterSessions)

	// // User routes - most require authentication
	// users := v1.Group("/users")

	// // User management - requires authentication and permissions
	// users.Use(cm.RequireAuth())
	// // Routes that require user_read permission
	// userRead := users.Group("")
	// userRead.Use(cm.RequirePermission("user_read"))
	// userRead.GET("", userHandler.ListUsers)
	// userRead.GET("/:id", userHandler.GetUser)

	// // Routes that require user_write permission
	// userWrite := users.Group("")
	// userWrite.Use(cm.RequirePermission("user_write"))
	// userWrite.POST("", userHandler.CreateUser)
	// userWrite.PUT("/:id", userHandler.UpdateUser)
	// userWrite.DELETE("/:id", userHandler.DeleteUser)

	// users.GET("/:id/roles", userHandler.GetUserRoles)
	// users.POST("/:id/roles", userHandler.AssignRolesToUser)
	// // MFA routes - users can only modify their own MFA settings
	// users.POST("/mfa/enable", userHandler.EnableMFA)
	// users.POST("/mfa/disable", userHandler.DisableMFA)

	// // Role routes - all require authentication and permissions
	// roles := v1.Group("/roles")
	// roles.Use(cm.RequireAuth())

	// // Routes that require role_read permission
	// roleRead := roles.Group("")
	// roleRead.Use(cm.RequirePermission("role_read"))
	// roleRead.GET("", roleHandler.ListRoles)
	// roleRead.GET("/:id", roleHandler.GetRole)
	// roleRead.GET("/:id/permissions", roleHandler.GetRolePermissions)
	// roleRead.GET("/:id/users", roleHandler.GetRoleUsers)

	// // Routes that require role_write permission
	// roleWrite := roles.Group("")
	// roleWrite.Use(cm.RequirePermission("role_write"))
	// roleWrite.POST("", roleHandler.CreateRole)
	// roleWrite.PUT("/:id", roleHandler.UpdateRole)
	// roleWrite.DELETE("/:id", roleHandler.DeleteRole)
	// roleWrite.POST("/:id/permissions", roleHandler.AssignPermissionsToRole)
	// roleWrite.DELETE("/:id/permissions/:permission_id", roleHandler.RemovePermissionFromRole)
	// roleWrite.POST("/:id/users", roleHandler.AssignRoleToUsers)
	// roleWrite.DELETE("/:id/users/:user_id", roleHandler.RemoveRoleFromUser)

	// // Permission routes - all require authentication and permissions
	// permissions := v1.Group("/permissions")
	// permissions.Use(cm.RequireAuth())

	// // Routes that require permission_read permission
	// permRead := permissions.Group("")
	// permRead.Use(cm.RequirePermission("permission_read"))
	// permRead.GET("", permissionHandler.ListPermissions)
	// permRead.GET("/:id", permissionHandler.GetPermission)

	// // Routes that require permission_write permission
	// permWrite := permissions.Group("")
	// permWrite.Use(cm.RequirePermission("permission_write"))
	// permWrite.POST("", permissionHandler.CreatePermission)
	// permWrite.PUT("/:id", permissionHandler.UpdatePermission)
	// permWrite.DELETE("/:id", permissionHandler.DeletePermission)
}
