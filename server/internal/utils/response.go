package utils

import (
	"log"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

type StatusCode int

// Common status codes for consistency
const (
	StatusCodeSuccess            StatusCode = http.StatusOK
	StatusCodeCreated            StatusCode = http.StatusCreated
	StatusCodeAccepted           StatusCode = http.StatusAccepted
	StatusCodeNoContent          StatusCode = http.StatusNoContent
	StatusCodeResetContent       StatusCode = http.StatusResetContent
	StatusCodeBadRequest         StatusCode = http.StatusBadRequest
	StatusCodeUnauthorized       StatusCode = http.StatusUnauthorized
	StatusCodeForbidden          StatusCode = http.StatusForbidden
	StatusCodeNotFound           StatusCode = http.StatusNotFound
	StatusCodeConflict           StatusCode = http.StatusConflict
	StatusCodeInternalError      StatusCode = http.StatusInternalServerError
	StatusCodeServiceUnavailable StatusCode = http.StatusServiceUnavailable
)

type ErrorCode string

// Common error codes for consistency
const (
	ErrorCodeValidationFailed   ErrorCode = "validation_failed"
	ErrorCodeInvalidRequest     ErrorCode = "invalid_request"
	ErrorCodeResourceNotFound   ErrorCode = "resource_not_found"
	ErrorCodeResourceInUse      ErrorCode = "resource_in_use"
	ErrorCodeDatabaseError      ErrorCode = "database_error"
	ErrorCodeUnauthorized       ErrorCode = "unauthorized"
	ErrorCodeForbidden          ErrorCode = "forbidden"
	ErrorCodeDuplicateEntry     ErrorCode = "duplicate_entry"
	ErrorCodeInternalError      ErrorCode = "internal_error"
	ErrorCodeServiceUnavailable ErrorCode = "service_unavailable"
	ErrorCodeTokenExpired       ErrorCode = "token_expired"
	ErrorCodeRateLimitExceeded  ErrorCode = "rate_limit_exceeded"
)

type Status string

// Common status values for consistency
const (
	StatusSuccess       Status = "success"
	StatusError         Status = "error"
	StatusInternalError Status = "internal_error"
)

// APIResponse defines the standard response structure
type APIResponse struct {
	Status    Status    `json:"status"`
	Message   string    `json:"message"`
	Data      any       `json:"data,omitempty"`
	Error     *APIError `json:"error,omitempty"`
	Timestamp string    `json:"timestamp"`
}

// APIError defines the standard error structure
type APIError struct {
	Code        ErrorCode `json:"code"`
	Description string    `json:"description"`
	Details     any       `json:"details,omitempty"`
}

// NewSuccessResponse creates a standard success response
func NewSuccessResponse(message string, data any) *APIResponse {
	return &APIResponse{
		Status:    StatusSuccess,
		Message:   message,
		Data:      data,
		Timestamp: time.Now().Format(time.RFC3339),
	}
}

// NewErrorResponse creates a standard error response
func NewErrorResponse(message string, errorCode ErrorCode, description string, details any) *APIResponse {
	return &APIResponse{
		Status:  StatusError,
		Message: message,
		Error: &APIError{
			Code:        errorCode,
			Description: description,
			Details:     details,
		},
		Timestamp: time.Now().Format(time.RFC3339),
	}
}

// RespondWithSuccess sends a standardized success response
func RespondWithSuccess(c echo.Context, statusCode StatusCode, message string, data any) error {
	return c.JSON(int(statusCode), NewSuccessResponse(message, data))
}

// RespondWithError sends a standardized error response
func RespondWithError(c echo.Context, statusCode StatusCode, message string, errorCode ErrorCode, description string, details any) error {
	return c.JSON(int(statusCode), NewErrorResponse(message, errorCode, description, details))
}

// RespondWithInternalError sends a standardized internal server error response
// and logs the detailed error for debugging purposes
func RespondWithInternalError(c echo.Context, message string, err error) error {
	// Log the detailed error for server-side debugging
	log.Printf("INTERNAL SERVER ERROR: %v - %v", message, err)

	// Return a generic message to the client to avoid exposing sensitive information
	return RespondWithError(
		c,
		StatusCodeInternalError,
		"Internal Server Error",
		ErrorCodeInternalError,
		"An unexpected error occurred while processing your request",
		nil,
	)
}
