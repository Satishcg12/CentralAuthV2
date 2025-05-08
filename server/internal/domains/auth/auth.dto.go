package auth

// register

type RegisterRequst struct {
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
