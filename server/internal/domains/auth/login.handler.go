package auth

import (
	"database/sql"
	"time"

	"github.com/Satishcg12/CentralAuthV2/server/internal/db/sqlc"
	"github.com/Satishcg12/CentralAuthV2/server/internal/utils"
	"github.com/labstack/echo/v4"
)

func (h *AuthHandler) Login(c echo.Context) error {
	// take the request body
	req := new(LoginRequest)
	if err := c.Bind(req); err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid request data",
			utils.ErrorCodeInvalidRequest,
			"Could parse request body",
			err,
		)
	}
	// validate the request body
	if err := c.Validate(req); err != nil {

		return err
	}
	// check if the user exists
	user, err := h.store.GetUserByIdentifier(c.Request().Context(), req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return utils.RespondWithError(
				c,
				utils.StatusCodeUnauthorized,
				"Invalid credentials",
				utils.ErrorCodeUnauthorized,
				"Invalid email or password",
				err,
			)
		}
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeDatabaseError,
			"Could not check if user exists",
			err,
		)
	}
	// check if the password is correct
	isValid, err := utils.ComparePasswords(user.PasswordHash, req.Password)
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeInternalError,
			"Could not compare passwords",
			err,
		)
	}
	if !isValid {
		return utils.RespondWithError(
			c,
			utils.StatusCodeUnauthorized,
			"Invalid credentials",
			utils.ErrorCodeUnauthorized,
			"Invalid email or password",
			nil,
		)
	}

	// generate the access and refresh tokens
	accessToken, refreshToken, err := utils.GenerateToken(utils.AccessTokenClaims{
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
			"Could not generate tokens",
			err,
		)
	}

	// get the device name from the request
	ipAddress := c.RealIP()
	userAgent := c.Request().UserAgent()
	deviceName := utils.ExtractDeviceName(userAgent)
	tokenFamily, err := utils.GenerateRandomString(10)
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeInternalError,
			"Could not generate token family",
			err,
		)
	}

	_, err = h.store.CreateSession(c.Request().Context(), sqlc.CreateSessionParams{
		UserID:       user.ID,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		DeviceName:   sql.NullString{String: deviceName, Valid: deviceName != ""},
		IpAddress:    sql.NullString{String: ipAddress, Valid: ipAddress != ""},
		UserAgent:    sql.NullString{String: userAgent, Valid: userAgent != ""},
		TokenFamily:  tokenFamily,
		ExpiresAt:    time.Now().Add(time.Duration(h.config.JWT.ExpiryHours) * time.Hour),
		PreviousTokenID: sql.NullInt32{
			Int32: 0,
			Valid: false,
		},
	})
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeInternalError,
			"Could not create session",
			err,
		)
	}

	res := LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		UserID:       int(user.ID),
	}

	// set the access and refresh tokens in the response header
	utils.SetTokensCookies(c, accessToken, refreshToken)
	return utils.RespondWithSuccess(
		c,
		utils.StatusCodeSuccess,
		"User logged in successfully",
		res,
	)

}
