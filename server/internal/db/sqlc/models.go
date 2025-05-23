// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0

package sqlc

import (
	"database/sql"
	"time"
)

type AccessToken struct {
	ID             int32     `json:"id"`
	RefreshTokenID int32     `json:"refresh_token_id"`
	Token          string    `json:"token"`
	ExpiresAt      time.Time `json:"expires_at"`
	CreatedAt      time.Time `json:"created_at"`
}

type Client struct {
	ID                   int32          `json:"id"`
	ClientID             string         `json:"client_id"`
	ClientSecret         string         `json:"client_secret"`
	Name                 string         `json:"name"`
	Description          sql.NullString `json:"description"`
	Website              sql.NullString `json:"website"`
	RedirectUri          string         `json:"redirect_uri"`
	IsPublic             bool           `json:"is_public"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	OidcEnabled          bool           `json:"oidc_enabled"`
	AllowedScopes        []string       `json:"allowed_scopes"`
	AllowedGrantTypes    []string       `json:"allowed_grant_types"`
	AllowedResponseTypes []string       `json:"allowed_response_types"`
}

type OidcAccessToken struct {
	ID        int32     `json:"id"`
	Token     string    `json:"token"`
	ClientID  string    `json:"client_id"`
	UserID    int32     `json:"user_id"`
	ExpiresAt time.Time `json:"expires_at"`
	Scopes    []string  `json:"scopes"`
	CreatedAt time.Time `json:"created_at"`
}

type OidcAuthCode struct {
	ID                  int32          `json:"id"`
	Code                string         `json:"code"`
	ClientID            string         `json:"client_id"`
	UserID              int32          `json:"user_id"`
	RedirectUri         string         `json:"redirect_uri"`
	ExpiresAt           time.Time      `json:"expires_at"`
	Scopes              []string       `json:"scopes"`
	CodeChallenge       sql.NullString `json:"code_challenge"`
	CodeChallengeMethod sql.NullString `json:"code_challenge_method"`
	Used                bool           `json:"used"`
	Nonce               sql.NullString `json:"nonce"`
	CreatedAt           time.Time      `json:"created_at"`
}

type OidcRefreshToken struct {
	ID            int32     `json:"id"`
	Token         string    `json:"token"`
	ClientID      string    `json:"client_id"`
	UserID        int32     `json:"user_id"`
	AccessTokenID int32     `json:"access_token_id"`
	ExpiresAt     time.Time `json:"expires_at"`
	Scopes        []string  `json:"scopes"`
	Revoked       bool      `json:"revoked"`
	CreatedAt     time.Time `json:"created_at"`
}

type RefreshToken struct {
	ID        int32          `json:"id"`
	SessionID int32          `json:"session_id"`
	Token     string         `json:"token"`
	ClientID  sql.NullString `json:"client_id"`
	ExpiresAt time.Time      `json:"expires_at"`
	CreatedAt time.Time      `json:"created_at"`
}

type Session struct {
	ID             int32          `json:"id"`
	DeviceName     sql.NullString `json:"device_name"`
	IpAddress      sql.NullString `json:"ip_address"`
	UserAgent      sql.NullString `json:"user_agent"`
	Status         interface{}    `json:"status"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	IsLogout       bool           `json:"is_logout"`
	LastAccessedAt time.Time      `json:"last_accessed_at"`
	UserID         int32          `json:"user_id"`
}

type User struct {
	ID                  int32          `json:"id"`
	FirstName           string         `json:"first_name"`
	LastName            string         `json:"last_name"`
	Username            string         `json:"username"`
	Email               string         `json:"email"`
	EmailVerified       bool           `json:"email_verified"`
	PasswordHash        string         `json:"password_hash"`
	PhoneNumber         sql.NullString `json:"phone_number"`
	PhoneNumberVerified bool           `json:"phone_number_verified"`
	IsActive            bool           `json:"is_active"`
	MfaEnabled          bool           `json:"mfa_enabled"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
}
