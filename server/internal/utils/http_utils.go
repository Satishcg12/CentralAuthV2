package utils

import (
	"encoding/json"
	"strings"

	"github.com/labstack/echo/v4"
)

// GetTokenFromRequest extracts the authentication token from the request
// It checks both the Authorization header and cookies
func GetTokenFromRequest(c echo.Context) string {
	// Token could be in the Authorization header
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader != "" {
		// Check if it's a Bearer token
		if strings.HasPrefix(authHeader, "Bearer ") {
			return authHeader[7:] // Remove "Bearer " prefix
		}
		return authHeader
	}

	// Check for access_token cookie first (new standard)
	accessTokenCookie, err := c.Cookie("access_token")
	if err == nil && accessTokenCookie != nil {
		return accessTokenCookie.Value
	}

	// If no token found, return empty string
	return ""
}

// GetIPAddress returns the client's IP address
func GetIPAddress(c echo.Context) string {
	// Check for X-Forwarded-For header
	forwarded := c.Request().Header.Get("X-Forwarded-For")
	if forwarded != "" {
		// X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2)
		// The client's IP address is the first one
		ips := strings.Split(forwarded, ",")
		return strings.TrimSpace(ips[0])
	}

	// If no X-Forwarded-For header, use the remote address
	return c.RealIP()
}

// GetUserAgent returns the client's user agent string
func GetUserAgent(c echo.Context) string {
	return c.Request().UserAgent()
}

// ParseBody parses the request body into the provided struct
func ParseBody(c echo.Context, v interface{}) error {
	return c.Bind(v)
}

// GetQueryParam gets a query parameter with a default value
func GetQueryParam(c echo.Context, name, defaultValue string) string {
	value := c.QueryParam(name)
	if value == "" {
		return defaultValue
	}
	return value
}

// GetIntQueryParam gets an integer query parameter with a default value
func GetIntQueryParam(c echo.Context, name string, defaultValue int) (int, error) {
	return StringToInt(c.QueryParam(name), defaultValue)
}

// GetBoolQueryParam gets a boolean query parameter
func GetBoolQueryParam(c echo.Context, name string, defaultValue bool) bool {
	value := c.QueryParam(name)
	if value == "" {
		return defaultValue
	}

	// Convert string to bool
	if value == "1" || value == "true" || value == "yes" || value == "on" {
		return true
	} else if value == "0" || value == "false" || value == "no" || value == "off" {
		return false
	}

	return defaultValue
}

// ExtractDeviceName tries to determine a user-friendly device name from the user agent
func ExtractDeviceName(userAgent string) string {
	// This is a simple implementation - in production, you'd want a more robust parser
	if strings.Contains(userAgent, "iPhone") {
		return "iPhone"
	} else if strings.Contains(userAgent, "iPad") {
		return "iPad"
	} else if strings.Contains(userAgent, "Android") {
		return "Android Device"
	} else if strings.Contains(userAgent, "Windows") {
		return "Windows PC"
	} else if strings.Contains(userAgent, "Macintosh") {
		return "Mac"
	} else if strings.Contains(userAgent, "Linux") {
		return "Linux Device"
	}
	return "Unknown Device"
}

// ToJSON converts a struct to a JSON string
func ToJSON(v interface{}) (string, error) {
	jsonBytes, err := json.Marshal(v)
	if err != nil {
		return "", err
	}
	return string(jsonBytes), nil
}

// FromJSON parses a JSON string into the provided struct
func FromJSON(jsonStr string, v interface{}) error {
	return json.Unmarshal([]byte(jsonStr), v)
}
