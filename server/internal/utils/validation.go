package utils

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

// CustomValidator defines the validation handling structure
type CustomValidator struct {
	validator *validator.Validate
}

// Validate performs validation and returns an error if validation fails
func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		// Return a validation error with the original validation errors preserved
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			// Store the original validation errors in the Internal field
			return echo.NewHTTPError(echo.ErrBadRequest.Code, "Validation failed").SetInternal(validationErrors)
		}
		// Still return a validation error for other error types
		return echo.NewHTTPError(echo.ErrBadRequest.Code, err.Error())
	}
	return nil
}

// NewValidator creates a new validator instance
func NewValidator() *CustomValidator {
	v := validator.New()

	// Register custom tag name function to convert struct field into json tag name
	v.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})

	// Register any custom validations
	RegisterCustomValidations(v)

	return &CustomValidator{
		validator: v,
	}
}

// RegisterCustomValidations registers any custom validation functions
func RegisterCustomValidations(v *validator.Validate) {
	// Add custom validations here if needed
	// Example: v.RegisterValidation("custom_tag", customValidationFunc)
}

// FormatValidationErrors formats validation errors into a user-friendly map
func FormatValidationErrors(validationErrs validator.ValidationErrors) map[string]string {
	validationErrors := make(map[string]string)
	// For each validation error, create a friendly message
	for _, e := range validationErrs {
		field := strings.ToLower(e.Field())
		fmt.Printf("Field: %s, Tag: %s, Param: %s\n", field, e.Tag(), e.Param())
		// Create friendly error message based on the validation tag
		var message string
		switch e.Tag() {
		case "required":
			message = fmt.Sprintf("%s is required", field)
		case "email":
			message = fmt.Sprintf("%s must be a valid email address", field)
		case "min":
			message = fmt.Sprintf("%s must be at least %s characters long", field, e.Param())
		case "max":
			message = fmt.Sprintf("%s must be at most %s characters long", field, e.Param())
		case "eqfield":
			fieldName := strings.ToLower(e.Param())
			message = fmt.Sprintf("%s must be equal to %s", field, fieldName)
		default:
			message = fmt.Sprintf("%s failed validation: %s=%s", field, e.Tag(), e.Param())
		}

		validationErrors[field] = message
	}

	return validationErrors
}
