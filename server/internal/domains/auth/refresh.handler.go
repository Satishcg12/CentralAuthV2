package auth

import (
	"database/sql"
	"log"
	"time"

	"github.com/Satishcg12/CentralAuthV2/server/internal/db/sqlc"
	"github.com/Satishcg12/CentralAuthV2/server/internal/utils"
	"github.com/labstack/echo/v4"
)

func (h *AuthHandler) Refresh(c echo.Context) error {
	// get Refresh token from context
	refreshToken := c.Get("refresh_token").(string)
	if refreshToken == "" {
		// try to get from request
		req := new(RefreshRequest)
		if err := c.Bind(req); err != nil {
			return utils.RespondWithError(
				c,
				utils.StatusCodeBadRequest,
				"Invalid request data",
				utils.ErrorCodeInvalidRequest,
				"Could not parse request body",
				nil,
			)
		}
		// Validate that we have a refresh token
		if req.RefreshToken == "" {
			return utils.RespondWithError(
				c,
				utils.StatusCodeBadRequest,
				"Missing refresh token",
				utils.ErrorCodeInvalidRequest,
				"Refresh token is required",
				nil,
			)
		}
		refreshToken = req.RefreshToken
	}

	// retrieve refresh token from db
	tokenInfo, err := h.store.GetRefreshTokenByToken(c.Request().Context(), refreshToken)
	if err != nil {
		if err == sql.ErrNoRows {
			return utils.RespondWithError(
				c,
				utils.StatusCodeUnauthorized,
				"Invalid refresh token",
				utils.ErrorCodeUnauthorized,
				"Refresh token is invalid or expired",
				nil,
			)
		}
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Token retrieval failed",
			utils.ErrorCodeInternalError,
			"Could not retrieve token from database",
			err,
		)
	}

	// check if the refresh token is expired
	if tokenInfo.ExpiresAt.Before(time.Now()) {
		return utils.RespondWithError(
			c,
			utils.StatusCodeUnauthorized,
			"Refresh token expired",
			utils.ErrorCodeUnauthorized,
			"Refresh token has expired, please login again",
			nil,
		)
	}

	// check if the session is valid
	if tokenInfo.Status != "active" || tokenInfo.IsLogout {
		return utils.RespondWithError(
			c,
			utils.StatusCodeUnauthorized,
			"Session invalid",
			utils.ErrorCodeUnauthorized,
			"Session is not active, please login again",
			nil,
		)
	}

	// Get user from database to include in the new token
	user, err := h.store.GetUserById(c.Request().Context(), tokenInfo.UserID)
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeInternalError,
			"Could not get user information",
			err,
		)
	}

	// Generate a new access token only (refresh token remains the same)
	newAccessToken, _, err := utils.GenerateToken(utils.AccessTokenClaims{
		UserID:        int64(user.ID),
		Username:      user.Username,
		Email:         user.Email,
		FirstName:     user.FirstName,
		LastName:      user.LastName,
		EmailVerified: user.EmailVerified,
		PhoneVerified: user.PhoneNumber.Valid && user.PhoneNumber.String != "",
	})

	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeInternalError,
			"Could not generate new access token",
			err,
		)
	}

	// Calculate new expiration time for access token
	accessTokenExpiry := time.Now().Add(time.Duration(h.config.JWT.ExpiryHours) * time.Hour)

	// Update or create a new access token
	err = h.store.UpdateAccessToken(c.Request().Context(), sqlc.UpdateAccessTokenParams{
		RefreshTokenID: tokenInfo.ID,
		Token:          newAccessToken,
		ExpiresAt:      accessTokenExpiry,
	})

	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeInternalError,
			"Could not update access token",
			err,
		)
	}

	// Update the last accessed timestamp for the session
	err = h.store.UpdateLastAccessed(c.Request().Context(), tokenInfo.SessionID)
	if err != nil {
		// Non-critical error, just log it
		log.Printf("Failed to update last_accessed_at: %v", err)
	}

	// Set the new access token in cookies
	utils.SetAccessTokenCookie(c, newAccessToken)

	// Return the new access token
	res := RefreshResponse{
		AccessToken:  newAccessToken,
		RefreshToken: refreshToken,
		UserID:       int(user.ID),
		ExpireAt:     accessTokenExpiry.Unix(),
	}

	return utils.RespondWithSuccess(
		c,
		utils.StatusCodeSuccess,
		"Access token refreshed successfully",
		res,
	)
}
