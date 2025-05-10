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
	// get session from the store
	// if session is not found, return unauthorized
	session, err := h.store.GetSessionByAccessToken(c.Request().Context(), accessToken)
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
			"Could not get session",
			err,
		)
	}
	// revoke the session
	if err := h.store.RevokeSession(c.Request().Context(), session.ID); err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeDatabaseError,
			"Could not revoke session",
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
