package utils

func GenerateToken(claims AccessTokenClaims) (string, string, error) {
	// Generate access token
	accessToken, _, err := CreateAccessToken(claims)
	if err != nil {
		return "", "", err
	}

	// Generate refresh token
	refreshToken, err := GenerateRefreshToken()
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}
