package auth

import (
	"database/sql"

	"github.com/Satishcg12/CentralAuthV2/server/internal/db/sqlc"
	"github.com/Satishcg12/CentralAuthV2/server/internal/utils"
	"github.com/labstack/echo/v4"
)

func (h *AuthHandler) Register(c echo.Context) error {
	// take the request body
	req := new(RegisterRequst)
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

	// check if the phone number already exists
	_, err := h.store.GetUserByPhoneNumber(c.Request().Context(), sql.NullString{
		String: req.PhoneNumber,
		Valid:  req.PhoneNumber != "",
	})
	if err == nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeConflict,
			"User already exists",
			utils.ErrorCodeDuplicateEntry,

			"User with this phone number already exists",
			map[string]any{
				"phone_number": "Phone number already exists",
			},
		)
	} else if err != sql.ErrNoRows {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeDatabaseError,
			"Could not check if user exists",
			err,
		)
	}

	// check if the username already exists
	_, err = h.store.GetUserByUsername(c.Request().Context(), req.Username)
	if err == nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeConflict,
			"User already exists",
			utils.ErrorCodeDuplicateEntry,
			"User with this username already exists",
			map[string]any{
				"username": "Username already exists",
			},
		)
	} else if err != sql.ErrNoRows {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeDatabaseError,
			"Could not check if user exists",
			err,
		)
	}

	// check if the email already exists
	_, err = h.store.GetUserByEmail(c.Request().Context(), req.Email)
	if err == nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeConflict,
			"User already exists",
			utils.ErrorCodeDuplicateEntry,
			"User with this email already exists",
			map[string]any{
				"email": "Email already exists",
			},
		)
	} else if err != sql.ErrNoRows {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeDatabaseError,
			"Could not check if user exists",
			err,
		)
	}

	// hash the password
	hashedPassword, err := utils.Hash(req.Password)
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeInternalError,
			"Could not hash password",
			err,
		)
	}

	// create the user
	user, err := h.store.RegisterUser(c.Request().Context(), sqlc.RegisterUserParams{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		PhoneNumber: sql.NullString{
			String: req.PhoneNumber,
			Valid:  req.PhoneNumber != "",
		},
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hashedPassword,
	})
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Internal server error",
			utils.ErrorCodeDatabaseError,
			"Could not create user",
			err,
		)
	}

	// create the response
	res := RegisterResponse{
		UserID: int(user.ID),
	}

	// send the response
	return utils.RespondWithSuccess(
		c,
		utils.StatusCodeCreated,
		"User created successfully",
		res,
	)
}
