package utils

func GenerateRefreshToken() (string, error) {
	// Generate a random refresh token
	refreshToken, err := GenerateRandomString(32)
	if err != nil {
		return "", err
	}
	return refreshToken, nil
}
