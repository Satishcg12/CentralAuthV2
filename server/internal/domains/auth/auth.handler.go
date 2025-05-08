package auth

import (
	"github.com/Satishcg12/CentralAuthV2/server/internal/config"
	"github.com/Satishcg12/CentralAuthV2/server/internal/db"
	"github.com/Satishcg12/CentralAuthV2/server/internal/domains"
)

type AuthHandler struct {
	store  *db.Store
	config *config.Config
}

// NewAuthHandler creates a new authentication handler
func NewAuthHandler(ah *domains.AppHanders) *AuthHandler {
	return &AuthHandler{
		store:  ah.Store,
		config: ah.Cfg,
	}
}
