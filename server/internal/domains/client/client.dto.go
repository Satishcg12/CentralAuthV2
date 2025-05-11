package client

import "time"

// ==========
// Client DTOs
// ==========

// CreateClientRequest represents the request to create a new client
type CreateClientRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=100"`
	Description string `json:"description" validate:"max=500"`
	Website     string `json:"website" validate:"omitempty,url,max=255"`
	RedirectURI string `json:"redirect_uri" validate:"required,url,max=255"`
	IsPublic    bool   `json:"is_public"`
}

// UpdateClientRequest represents the request to update an existing client
type UpdateClientRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=100"`
	Description string `json:"description" validate:"max=500"`
	Website     string `json:"website" validate:"omitempty,url,max=255"`
	RedirectURI string `json:"redirect_uri" validate:"required,url,max=255"`
	IsPublic    bool   `json:"is_public"`
}

// ClientResponse represents the response for a client
type ClientResponse struct {
	ID          int64     `json:"id"`
	ClientID    string    `json:"client_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Website     string    `json:"website"`
	RedirectURI string    `json:"redirect_uri"`
	IsPublic    bool      `json:"is_public"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ClientDetailResponse represents the detailed response for a client including the secret
type ClientDetailResponse struct {
	ID           int64     `json:"id"`
	ClientID     string    `json:"client_id"`
	ClientSecret string    `json:"client_secret"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Website      string    `json:"website"`
	RedirectURI  string    `json:"redirect_uri"`
	IsPublic     bool      `json:"is_public"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// ClientListResponse represents the response for a list of clients
type ClientListResponse struct {
	Clients []ClientResponse `json:"clients"`
	Total   int64            `json:"total"`
}
