package client

import (
	"database/sql"
	"strconv"

	"github.com/Satishcg12/CentralAuthV2/server/internal/config"
	"github.com/Satishcg12/CentralAuthV2/server/internal/db"
	"github.com/Satishcg12/CentralAuthV2/server/internal/db/sqlc"
	"github.com/Satishcg12/CentralAuthV2/server/internal/domains"
	"github.com/Satishcg12/CentralAuthV2/server/internal/utils"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// ClientHandler handles client-related requests
type ClientHandler struct {
	store  *db.Store
	config *config.Config
}

// NewClientHandler creates a new client handler
func NewClientHandler(ah *domains.AppHandlers) *ClientHandler {
	return &ClientHandler{
		store:  ah.Store,
		config: ah.Cfg,
	}
}

// Create handles the creation of a new client
func (h *ClientHandler) Create(c echo.Context) error {
	// Parse and validate request
	req := new(CreateClientRequest)
	if err := c.Bind(req); err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid request data",
			utils.ErrorCodeInvalidRequest,
			"Could not parse request body",
			err,
		)
	}

	if err := c.Validate(req); err != nil {
		return err
	}

	// Generate client ID and secret
	clientID := uuid.New().String()
	clientSecret, _ := utils.GenerateRandomString(32)

	// Create client in database
	client, err := h.store.CreateClient(c.Request().Context(), sqlc.CreateClientParams{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Name:         req.Name,
		Description: sql.NullString{
			String: req.Description,
			Valid:  req.Description != "",
		},
		Website: sql.NullString{
			String: req.Website,
			Valid:  req.Website != "",
		},
		RedirectUri: req.RedirectURI,
		IsPublic:    req.IsPublic,
	})

	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to create client",
			utils.ErrorCodeDatabaseError,
			"Could not create client",
			err,
		)
	}

	// Prepare response
	res := ClientDetailResponse{
		ID:           int64(client.ID),
		ClientID:     client.ClientID,
		ClientSecret: client.ClientSecret,
		Name:         client.Name,
		Description:  client.Description.String,
		Website:      client.Website.String,
		RedirectURI:  client.RedirectUri,
		IsPublic:     client.IsPublic,
		CreatedAt:    client.CreatedAt,
		UpdatedAt:    client.UpdatedAt,
	}

	return utils.RespondWithSuccess(
		c,
		utils.StatusCodeCreated,
		"Client created successfully",
		res,
	)
}

// GetAll handles retrieving all clients
func (h *ClientHandler) GetAll(c echo.Context) error {
	clients, err := h.store.ListClients(c.Request().Context())
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to retrieve clients",
			utils.ErrorCodeDatabaseError,
			"Could not retrieve clients",
			err,
		)
	}

	// Prepare response
	clientResponses := make([]ClientResponse, 0, len(clients))
	for _, client := range clients {
		clientResponses = append(clientResponses, ClientResponse{
			ID:          int64(client.ID),
			ClientID:    client.ClientID,
			Name:        client.Name,
			Description: client.Description.String,
			Website:     client.Website.String,
			RedirectURI: client.RedirectUri,
			IsPublic:    client.IsPublic,
			CreatedAt:   client.CreatedAt,
			UpdatedAt:   client.UpdatedAt,
		})
	}

	return utils.RespondWithSuccess(
		c,
		utils.StatusCodeSuccess,
		"Clients retrieved successfully",
		ClientListResponse{
			Clients: clientResponses,
			Total:   int64(len(clientResponses)),
		},
	)
}

// GetByID handles retrieving a client by ID
func (h *ClientHandler) GetByID(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid client ID",
			utils.ErrorCodeInvalidRequest,
			"Client ID is required",
			nil,
		)
	}

	// Convert string ID to int32
	idInt, err := strconv.ParseInt(id, 10, 32)
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid client ID",
			utils.ErrorCodeInvalidRequest,
			"Client ID must be a valid integer",
			err,
		)
	}

	client, err := h.store.GetClientByID(c.Request().Context(), int32(idInt))
	if err != nil {
		if err == sql.ErrNoRows {
			return utils.RespondWithError(
				c,
				utils.StatusCodeNotFound,
				"Client not found",
				utils.ErrorCodeResourceNotFound,
				"No client found with the provided ID",
				nil,
			)
		}
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to retrieve client",
			utils.ErrorCodeDatabaseError,
			"Could not retrieve client",
			err,
		)
	}

	// Prepare response (without secret)
	res := ClientResponse{
		ID:          int64(client.ID),
		ClientID:    client.ClientID,
		Name:        client.Name,
		Description: client.Description.String,
		Website:     client.Website.String,
		RedirectURI: client.RedirectUri,
		IsPublic:    client.IsPublic,
		CreatedAt:   client.CreatedAt,
		UpdatedAt:   client.UpdatedAt,
	}

	return utils.RespondWithSuccess(
		c,
		utils.StatusCodeSuccess,
		"Client retrieved successfully",
		res,
	)
}

// Update handles updating a client
func (h *ClientHandler) Update(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid client ID",
			utils.ErrorCodeInvalidRequest,
			"Client ID is required",
			nil,
		)
	}

	// Convert string ID to int32
	idInt, err := strconv.ParseInt(id, 10, 32)
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid client ID",
			utils.ErrorCodeInvalidRequest,
			"Client ID must be a valid integer",
			err,
		)
	}

	// Parse and validate request
	req := new(UpdateClientRequest)
	if err := c.Bind(req); err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid request data",
			utils.ErrorCodeInvalidRequest,
			"Could not parse request body",
			err,
		)
	}

	if err := c.Validate(req); err != nil {
		return err
	}

	// Check if client exists
	_, err = h.store.GetClientByID(c.Request().Context(), int32(idInt))
	if err != nil {
		if err == sql.ErrNoRows {
			return utils.RespondWithError(
				c,
				utils.StatusCodeNotFound,
				"Client not found",
				utils.ErrorCodeResourceNotFound,
				"No client found with the provided ID",
				nil,
			)
		}
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to check client existence",
			utils.ErrorCodeDatabaseError,
			"Could not check if client exists",
			err,
		)
	}

	// Update client
	client, err := h.store.UpdateClient(c.Request().Context(), sqlc.UpdateClientParams{
		ID:   int32(idInt),
		Name: req.Name,
		Description: sql.NullString{
			String: req.Description,
			Valid:  req.Description != "",
		},
		Website: sql.NullString{
			String: req.Website,
			Valid:  req.Website != "",
		},
		RedirectUri: req.RedirectURI,
		IsPublic:    req.IsPublic,
	})

	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to update client",
			utils.ErrorCodeDatabaseError,
			"Could not update client",
			err,
		)
	}

	// Prepare response
	res := ClientResponse{
		ID:          int64(client.ID),
		ClientID:    client.ClientID,
		Name:        client.Name,
		Description: client.Description.String,
		Website:     client.Website.String,
		RedirectURI: client.RedirectUri,
		IsPublic:    client.IsPublic,
		CreatedAt:   client.CreatedAt,
		UpdatedAt:   client.UpdatedAt,
	}

	return utils.RespondWithSuccess(
		c,
		utils.StatusCodeSuccess,
		"Client updated successfully",
		res,
	)
}

// Delete handles deleting a client
func (h *ClientHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid client ID",
			utils.ErrorCodeInvalidRequest,
			"Client ID is required",
			nil,
		)
	}

	// Convert string ID to int32
	idInt, err := strconv.ParseInt(id, 10, 32)
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid client ID",
			utils.ErrorCodeInvalidRequest,
			"Client ID must be a valid integer",
			err,
		)
	}

	// Check if client exists
	_, err = h.store.GetClientByID(c.Request().Context(), int32(idInt))
	if err != nil {
		if err == sql.ErrNoRows {
			return utils.RespondWithError(
				c,
				utils.StatusCodeNotFound,
				"Client not found",
				utils.ErrorCodeResourceNotFound,
				"No client found with the provided ID",
				nil,
			)
		}
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to check client existence",
			utils.ErrorCodeDatabaseError,
			"Could not check if client exists",
			err,
		)
	}

	// Delete client
	err = h.store.DeleteClient(c.Request().Context(), int32(idInt))
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to delete client",
			utils.ErrorCodeDatabaseError,
			"Could not delete client",
			err,
		)
	}

	return utils.RespondWithSuccess(
		c,
		utils.StatusCodeSuccess,
		"Client deleted successfully",
		nil,
	)
}

// RegenerateSecret handles regenerating a client's secret
func (h *ClientHandler) RegenerateSecret(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid client ID",
			utils.ErrorCodeInvalidRequest,
			"Client ID is required",
			nil,
		)
	}

	// Convert string ID to int32
	idInt, err := strconv.ParseInt(id, 10, 32)
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid client ID",
			utils.ErrorCodeInvalidRequest,
			"Client ID must be a valid integer",
			err,
		)
	}

	// Check if client exists
	_, err = h.store.GetClientByID(c.Request().Context(), int32(idInt))
	if err != nil {
		if err == sql.ErrNoRows {
			return utils.RespondWithError(
				c,
				utils.StatusCodeNotFound,
				"Client not found",
				utils.ErrorCodeResourceNotFound,
				"No client found with the provided ID",
				nil,
			)
		}
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to check client existence",
			utils.ErrorCodeDatabaseError,
			"Could not check if client exists",
			err,
		)
	}

	// Generate new secret
	newSecret, err := utils.GenerateRandomString(32)
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to generate client secret",
			utils.ErrorCodeInternalError,
			"Could not generate client secret",
			err,
		)
	}

	// Update client secret
	client, err := h.store.UpdateClientSecret(c.Request().Context(), sqlc.UpdateClientSecretParams{
		ID:           int32(idInt),
		ClientSecret: newSecret,
	})

	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to regenerate client secret",
			utils.ErrorCodeDatabaseError,
			"Could not regenerate client secret",
			err,
		)
	}

	// Prepare response
	res := ClientDetailResponse{
		ID:           int64(client.ID),
		ClientID:     client.ClientID,
		ClientSecret: client.ClientSecret,
		Name:         client.Name,
		Description:  client.Description.String,
		Website:      client.Website.String,
		RedirectURI:  client.RedirectUri,
		IsPublic:     client.IsPublic,
		CreatedAt:    client.CreatedAt,
		UpdatedAt:    client.UpdatedAt,
	}

	return utils.RespondWithSuccess(
		c,
		utils.StatusCodeSuccess,
		"Client secret regenerated successfully",
		res,
	)
}

// RegenerateSecretByClientID handles regenerating a client's secret using the client_id
func (h *ClientHandler) RegenerateSecretByClientID(c echo.Context) error {
	clientID := c.Param("client_id")
	if clientID == "" {
		return utils.RespondWithError(
			c,
			utils.StatusCodeBadRequest,
			"Invalid client ID",
			utils.ErrorCodeInvalidRequest,
			"Client ID is required",
			nil,
		)
	}

	// Check if client exists
	client, err := h.store.GetClientByClientID(c.Request().Context(), clientID)
	if err != nil {
		if err == sql.ErrNoRows {
			return utils.RespondWithError(
				c,
				utils.StatusCodeNotFound,
				"Client not found",
				utils.ErrorCodeResourceNotFound,
				"No client found with the provided client ID",
				nil,
			)
		}
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to check client existence",
			utils.ErrorCodeDatabaseError,
			"Could not check if client exists",
			err,
		)
	}

	// Generate new secret
	newSecret, err := utils.GenerateRandomString(32)
	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to generate client secret",
			utils.ErrorCodeInternalError,
			"Could not generate client secret",
			err,
		)
	}

	// Update client secret
	updatedClient, err := h.store.UpdateClientSecret(c.Request().Context(), sqlc.UpdateClientSecretParams{
		ID:           client.ID,
		ClientSecret: newSecret,
	})

	if err != nil {
		return utils.RespondWithError(
			c,
			utils.StatusCodeInternalError,
			"Failed to regenerate client secret",
			utils.ErrorCodeDatabaseError,
			"Could not regenerate client secret",
			err,
		)
	}

	// Prepare response
	res := ClientDetailResponse{
		ID:           int64(updatedClient.ID),
		ClientID:     updatedClient.ClientID,
		ClientSecret: updatedClient.ClientSecret,
		Name:         updatedClient.Name,
		Description:  updatedClient.Description.String,
		Website:      updatedClient.Website.String,
		RedirectURI:  updatedClient.RedirectUri,
		IsPublic:     updatedClient.IsPublic,
		CreatedAt:    updatedClient.CreatedAt,
		UpdatedAt:    updatedClient.UpdatedAt,
	}

	return utils.RespondWithSuccess(
		c,
		utils.StatusCodeSuccess,
		"Client secret regenerated successfully",
		res,
	)
}
