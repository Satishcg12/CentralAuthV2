package auth

import (
	"database/sql"

	"github.com/Satishcg12/CentralAuthV2/server/internal/utils"
	"github.com/labstack/echo/v4"
)

func (h *AuthHandler) Logout(c echo.Context) error {
	// if user is not logged in middleware will handle it

	// get the access token from the context
	accessToken, ok := c.Get("access_token").(string)
	if !ok {
		return utils.RespondWithError(
			c,
			utils.StatusCodeUnauthorized,
			"Unauthorized",
			utils.ErrorCodeUnauthorized,
			"User authentication required",
			nil,
		)
	}

	// Get access token info from database
	tokenInfo, err := h.store.GetAccessTokenByToken(c.Request().Context(), accessToken)
	if err != nil {
		if err == sql.ErrNoRows {
			return utils.RespondWithError(
				c,
				utils.StatusCodeUnauthorized,
				"Unauthorized",
				utils.ErrorCodeUnauthorized,
				"User authentication required",
				nil,
			)
		}
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeDatabaseError,
			"Could not get token information",
			err,
		)
	}

	// Mark the session as logged out
	// This will invalidate all refresh tokens tied to this session
	if err := h.store.LogoutSession(c.Request().Context(), tokenInfo.SessionID); err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeDatabaseError,
			"Could not logout session",
			err,
		)
	}

	// clear the cookies
	utils.DeleteTokensCookies(c)

	res := LogoutResponse{
		Success: true,
	}
	// return success response
	return utils.RespondWithSuccess(
		c,
		utils.StatusCodeSuccess,
		"Logout successful",
		res,
	)
}
