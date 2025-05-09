package utils

import (
	"fmt"
	"math/rand"
	"strconv"
	"strings"
	"time"
	"unicode"
)

var seededRand = rand.New(rand.NewSource(time.Now().UnixNano()))

// StringToInt converts a string to an integer with a default value if conversion fails
func StringToInt(s string, defaultValue int) (int, error) {
	if s == "" {
		return defaultValue, nil
	}

	val, err := strconv.Atoi(s)
	if err != nil {
		return defaultValue, err
	}

	return val, nil
}

// StringToFloat converts a string to a float with a default value if conversion fails
func StringToFloat(s string, defaultValue float64) (float64, error) {
	if s == "" {
		return defaultValue, nil
	}

	val, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return defaultValue, err
	}

	return val, nil
}

// StringToBool converts a string to a boolean with a default value if conversion fails
func StringToBool(s string, defaultValue bool) bool {
	if s == "" {
		return defaultValue
	}

	s = strings.ToLower(s)
	if s == "1" || s == "true" || s == "yes" || s == "on" {
		return true
	} else if s == "0" || s == "false" || s == "no" || s == "off" {
		return false
	}

	return defaultValue
}

// FormatTimestamp formats a timestamp according to the provided layout
func FormatTimestamp(t time.Time, layout string) string {
	return t.Format(layout)
}

// FormatTimestampISO formats a timestamp in ISO 8601 format
func FormatTimestampISO(t time.Time) string {
	return t.Format(time.RFC3339)
}

// Truncate truncates a string to the specified length and adds ellipsis if truncated
func Truncate(s string, maxLength int) string {
	if len(s) <= maxLength {
		return s
	}

	// Add ellipsis
	return s[:maxLength-3] + "..."
}

// SanitizeName removes special characters from a name
func SanitizeName(name string) string {
	// Only allow letters, numbers, spaces, and some punctuation
	var result strings.Builder
	for _, r := range name {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || unicode.IsSpace(r) ||
			r == '-' || r == '\'' || r == '.' {
			result.WriteRune(r)
		}
	}
	return result.String()
}

// IsValidEmail checks if an email address is valid
func IsValidEmail(email string) bool {
	// Basic check for now - can be enhanced with a proper regex
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// GenerateSlug creates a URL-friendly slug from a string
func GenerateSlug(s string) string {
	// Convert to lowercase
	s = strings.ToLower(s)

	// Replace spaces with hyphens
	s = strings.ReplaceAll(s, " ", "-")

	// Remove special characters
	var result strings.Builder
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '-' {
			result.WriteRune(r)
		}
	}

	// Remove consecutive hyphens
	for strings.Contains(s, "--") {
		s = strings.ReplaceAll(s, "--", "-")
	}

	// Trim hyphens from the beginning and end
	s = strings.Trim(s, "-")

	return s
}

// FormatBytes formats a byte size into a human-readable string
func FormatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}

	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}

	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

// FormatDuration formats a duration into a human-readable string
func FormatDuration(d time.Duration) string {
	// For durations less than a minute
	if d < time.Minute {
		return fmt.Sprintf("%d seconds", int(d.Seconds()))
	}

	// For durations less than an hour
	if d < time.Hour {
		minutes := int(d.Minutes())
		seconds := int(d.Seconds()) % 60
		return fmt.Sprintf("%d minutes, %d seconds", minutes, seconds)
	}

	// For durations less than a day
	if d < 24*time.Hour {
		hours := int(d.Hours())
		minutes := int(d.Minutes()) % 60
		return fmt.Sprintf("%d hours, %d minutes", hours, minutes)
	}

	// For longer durations
	days := int(d.Hours()) / 24
	hours := int(d.Hours()) % 24
	return fmt.Sprintf("%d days, %d hours", days, hours)
}

// GenerateRandomString generates a random string of the specified length
func GenerateRandomString(length int) (string, error) {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	if length <= 0 {
		return "", fmt.Errorf("length must be greater than 0")
	}

	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b), nil
}
