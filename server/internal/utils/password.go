package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/pbkdf2"
)

const (
	iterations = 600000
	keyLength  = 32
	saltLength = 16
)

func Hash(password string) (string, error) {
	// Generate random salt
	salt := make([]byte, saltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", fmt.Errorf("error generating salt: %w", err)
	}

	// Generate hash using PBKDF2
	hash := pbkdf2.Key([]byte(password), salt, iterations, keyLength, sha256.New)

	// Combine salt and hash, encode as base64
	combined := append(salt, hash...)
	encoded := base64.StdEncoding.EncodeToString(combined)

	return encoded, nil
}

func ComparePasswords(hashedPassword, password string) (bool, error) {
	// Decode the stored hash
	decoded, err := base64.StdEncoding.DecodeString(hashedPassword)
	if err != nil {
		return false, fmt.Errorf("error decoding hash: %w", err)
	}

	// Split salt and hash
	if len(decoded) < saltLength {
		return false, fmt.Errorf("invalid hash format")
	}
	salt := decoded[:saltLength]
	storedHash := decoded[saltLength:]

	// Generate hash with provided password
	newHash := pbkdf2.Key([]byte(password), salt, iterations, keyLength, sha256.New)

	// Compare hashes
	return string(storedHash) == string(newHash), nil
}
