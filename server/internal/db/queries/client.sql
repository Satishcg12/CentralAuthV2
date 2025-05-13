-- name: CreateClient :one
INSERT INTO clients (
    client_id,
    client_secret,
    name,
    description,
    website,
    redirect_uri,
    is_public,
    oidc_enabled,
    allowed_scopes,
    allowed_grant_types,
    allowed_response_types
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
) RETURNING *;

-- name: GetClientByID :one
SELECT * FROM clients
WHERE id = $1 LIMIT 1;

-- name: GetClientByClientID :one
SELECT * FROM clients
WHERE client_id = $1 LIMIT 1;

-- name: ListClients :many
SELECT * FROM clients
ORDER BY created_at DESC;

-- name: UpdateClient :one
UPDATE clients
SET
    name = $2,
    description = $3,
    website = $4,
    redirect_uri = $5,
    is_public = $6,
    oidc_enabled = $7,
    allowed_scopes = $8,
    allowed_grant_types = $9,
    allowed_response_types = $10,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: UpdateClientSecret :one
UPDATE clients
SET
    client_secret = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- name: DeleteClient :exec
DELETE FROM clients
WHERE id = $1;