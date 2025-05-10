-- name: CreateSession :one
INSERT INTO sessions (
    device_name,
    ip_address,
    user_agent,
    user_id
)
VALUES (
    $1, $2, $3, $4
)
RETURNING id;

-- name: CreateRefreshToken :one
INSERT INTO refresh_tokens (
    session_id,
    token,
    client_id,
    expires_at
)
VALUES (
    $1, $2, $3, $4
)
RETURNING id;

-- name: CreateAccessToken :one
INSERT INTO access_tokens (
    refresh_token_id,
    token,
    expires_at
)
VALUES (
    $1, $2, $3
)
RETURNING id;

-- name: GetSessionByID :one
SELECT * FROM sessions
WHERE id = $1
AND status = 'active'
AND is_logout = false
LIMIT 1;

-- name: GetRefreshTokenByToken :one
SELECT rt.*, s.user_id, s.is_logout, s.status 
FROM refresh_tokens rt
JOIN sessions s ON rt.session_id = s.id
WHERE rt.token = $1
AND s.status = 'active'
AND s.is_logout = false
LIMIT 1;

-- name: GetAccessTokenByToken :one
SELECT at.*, rt.session_id, s.user_id, s.status, s.is_logout
FROM access_tokens at
JOIN refresh_tokens rt ON at.refresh_token_id = rt.id
JOIN sessions s ON rt.session_id = s.id
WHERE at.token = $1
AND s.status = 'active'
AND s.is_logout = false
LIMIT 1;

-- name: UpdateAccessToken :exec
INSERT INTO access_tokens (
    refresh_token_id,
    token,
    expires_at
)
VALUES (
    $1, $2, $3
)
ON CONFLICT (refresh_token_id) 
DO UPDATE SET 
    token = EXCLUDED.token,
    expires_at = EXCLUDED.expires_at;

-- name: InvalidateRefreshToken :exec
DELETE FROM refresh_tokens
WHERE id = $1;

-- name: UpdateLastAccessed :exec
UPDATE sessions
SET last_accessed_at = CURRENT_TIMESTAMP
WHERE id = $1
AND status = 'active';

-- name: RevokeSession :exec
UPDATE sessions
SET status = 'revoked',
    is_logout = true,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
AND status = 'active';

-- name: GetUserSessions :many
SELECT s.*, COUNT(rt.id) as token_count 
FROM sessions s
LEFT JOIN refresh_tokens rt ON s.id = rt.session_id
WHERE s.user_id = $1
AND s.status = 'active'
AND s.is_logout = false
GROUP BY s.id
ORDER BY s.created_at DESC;

-- name: RevokeAllUserSessions :exec
UPDATE sessions
SET status = 'revoked',
    is_logout = true,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1
AND status = 'active';

-- name: GetRefreshTokensBySessionID :many
SELECT * FROM refresh_tokens
WHERE session_id = $1;

-- name: GetSessionByRefreshTokenID :one
SELECT s.*
FROM sessions s
JOIN refresh_tokens rt ON s.id = rt.session_id
WHERE rt.id = $1
AND s.status = 'active'
AND s.is_logout = false
LIMIT 1;

-- name: GetAccessTokenByRefreshTokenID :one
SELECT * FROM access_tokens
WHERE refresh_token_id = $1
LIMIT 1;

-- name: LogoutSession :exec
UPDATE sessions
SET status = 'inactive',
    is_logout = true,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
AND status = 'active';

-- name: GetRefreshTokenByClientID :many
SELECT rt.* 
FROM refresh_tokens rt
JOIN sessions s ON rt.session_id = s.id
WHERE rt.client_id = $1
AND s.user_id = $2
AND s.status = 'active'
AND s.is_logout = false;
