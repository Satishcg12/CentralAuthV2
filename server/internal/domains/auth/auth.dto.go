package auth

// ==========
// Auth DTOs
// ==========

// === Register Dto ===
type RegisterRequest struct {
	FirstName       string `json:"first_name" validate:"required,min=3,max=100"`
	LastName        string `json:"last_name" validate:"required,min=3,max=100"`
	PhoneNumber     string `json:"phone_number,omitempty" validate:"max=20"`
	Username        string `json:"username" validate:"required,min=3,max=100"`
	Email           string `json:"email" validate:"required,email,max=255"`
	Password        string `json:"password" validate:"required,min=8,max=72"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=Password"`
}

type RegisterResponse struct {
	UserID int `json:"user_id"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,max=100"`
	Password string `json:"password" validate:"required,max=72"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	UserID       int    `json:"user_id"`
	ExpireAt     int64  `json:"expire_at"`
}

type LogoutRequest struct {
	AccessToken string `json:"access_token" validate:"required"`
}
type LogoutResponse struct {
	Success bool `json:"success"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token,omite"`
}

type RefreshResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	UserID       int    `json:"user_id"`
	ExpireAt     int64  `json:"expire_at"`
}
