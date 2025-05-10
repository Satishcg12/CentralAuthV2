package utils

func GenerateRefreshToken() (string, error) {
	// Generate a random refresh token
	refreshToken, err := GenerateRandomString(32)
	if err != nil {
		return "", err
	}
	return refreshToken, nil
}

// GetDefaultClientID returns a default client ID for refresh tokens
// when the client doesn't provide one
func GetDefaultClientID() string {
	return "default"
}
