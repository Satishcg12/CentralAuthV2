package utils

import (
	"encoding/json"
	"net/http"
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

// SetAccessTokenCookie sets an HTTP cookie with the provided access token
func SetAccessTokenCookie(c echo.Context, accessToken string, expirySeconds int, secure bool) {
	cookie := new(http.Cookie)
	cookie.Name = "access_token"
	cookie.Value = accessToken
	cookie.Path = "/"
	cookie.MaxAge = expirySeconds
	cookie.HttpOnly = true // Not accessible via JavaScript
	cookie.Secure = secure // Only sent over HTTPS if true
	cookie.SameSite = http.SameSiteStrictMode
	c.SetCookie(cookie)
}

// SetRefreshTokenCookie sets an HTTP cookie with the provided refresh token
func SetRefreshTokenCookie(c echo.Context, refreshToken string, expirySeconds int, secure bool) {
	cookie := new(http.Cookie)
	cookie.Name = "refresh_token"
	cookie.Value = refreshToken
	cookie.Path = "/"
	cookie.MaxAge = expirySeconds
	cookie.HttpOnly = true // Not accessible via JavaScript
	cookie.Secure = secure // Only sent over HTTPS if true
	cookie.SameSite = http.SameSiteStrictMode
	c.SetCookie(cookie)
}

// ClearAuthCookies removes the authentication and refresh token cookies
func ClearAuthCookies(c echo.Context) {

	// Clear access_token cookie
	accessTokenCookie := new(http.Cookie)
	accessTokenCookie.Name = "access_token"
	accessTokenCookie.Value = ""
	accessTokenCookie.Path = "/"
	accessTokenCookie.MaxAge = -1
	accessTokenCookie.HttpOnly = true
	c.SetCookie(accessTokenCookie)

	// Clear refresh token cookie
	refreshCookie := new(http.Cookie)
	refreshCookie.Name = "refresh_token"
	refreshCookie.Value = ""
	refreshCookie.Path = "/"
	refreshCookie.MaxAge = -1
	refreshCookie.HttpOnly = true
	c.SetCookie(refreshCookie)
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

// ExtractDeviceInfo extracts device information from the user agent
func ExtractDeviceInfo(userAgent string) map[string]string {
	info := make(map[string]string)

	// Device type detection
	deviceType := "Unknown"
	if strings.Contains(userAgent, "Mobile") {
		deviceType = "Mobile"
	} else if strings.Contains(userAgent, "Tablet") {
		deviceType = "Tablet"
	} else {
		deviceType = "Desktop"
	}
	info["deviceType"] = deviceType

	// Operating system detection
	os := "Unknown"
	if strings.Contains(userAgent, "Windows") {
		os = "Windows"
	} else if strings.Contains(userAgent, "Mac OS") {
		os = "macOS"
	} else if strings.Contains(userAgent, "Linux") {
		os = "Linux"
	} else if strings.Contains(userAgent, "Android") {
		os = "Android"
	} else if strings.Contains(userAgent, "iOS") {
		os = "iOS"
	}
	info["os"] = os

	// Browser detection
	browser := "Unknown"
	if strings.Contains(userAgent, "Chrome") && !strings.Contains(userAgent, "Chromium") {
		browser = "Chrome"
	} else if strings.Contains(userAgent, "Firefox") {
		browser = "Firefox"
	} else if strings.Contains(userAgent, "Safari") && !strings.Contains(userAgent, "Chrome") {
		browser = "Safari"
	} else if strings.Contains(userAgent, "Edge") {
		browser = "Edge"
	}
	info["browser"] = browser

	return info
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
