-- name: CreateOIDCAuthCode :one
INSERT INTO oidc_auth_codes (
    code,
    client_id,
    user_id,
    redirect_uri,
    expires_at,
    scopes,
    code_challenge,
    code_challenge_method,
    nonce
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
) RETURNING *;

-- name: GetOIDCAuthCodeByCode :one
SELECT * FROM oidc_auth_codes
WHERE code = $1 AND used = false AND expires_at > NOW()
LIMIT 1;

-- name: MarkOIDCAuthCodeAsUsed :exec
UPDATE oidc_auth_codes
SET used = true
WHERE code = $1;

-- name: CreateOIDCAccessToken :one
INSERT INTO oidc_access_tokens (
    token,
    client_id,
    user_id,
    expires_at,
    scopes
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: GetOIDCAccessTokenByToken :one
SELECT * FROM oidc_access_tokens
WHERE token = $1 AND expires_at > NOW()
LIMIT 1;

-- name: CreateOIDCRefreshToken :one
INSERT INTO oidc_refresh_tokens (
    token,
    client_id,
    user_id,
    access_token_id,
    expires_at,
    scopes
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: GetOIDCRefreshTokenByToken :one
SELECT * FROM oidc_refresh_tokens
WHERE token = $1 AND revoked = false AND expires_at > NOW()
LIMIT 1;

-- name: RevokeOIDCRefreshToken :exec
UPDATE oidc_refresh_tokens
SET revoked = true
WHERE token = $1;

-- name: RevokeAllClientUserRefreshTokens :exec
UPDATE oidc_refresh_tokens
SET revoked = true
WHERE client_id = $1 AND user_id = $2;

-- name: DeleteExpiredOIDCTokens :exec
DELETE FROM oidc_auth_codes WHERE expires_at < NOW() OR used = true;
DELETE FROM oidc_access_tokens WHERE expires_at < NOW();
DELETE FROM oidc_refresh_tokens WHERE expires_at < NOW() OR revoked = true;

-- name: UpdateClientOIDCSettings :one
UPDATE clients
SET 
    oidc_enabled = $1,
    allowed_scopes = $2,
    allowed_grant_types = $3,
    allowed_response_types = $4,
    updated_at = NOW()
WHERE client_id = $5
RETURNING *;

-- name: GetClientWithOIDCSettings :one
SELECT * FROM clients
WHERE client_id = $1 AND oidc_enabled = true
LIMIT 1;
