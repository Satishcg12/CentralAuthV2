-- name: CreateSession :one
INSERT INTO sessions (
    access_token,
    refresh_token,
    device_name,
    ip_address,
    user_agent,
    expires_at,
    refresh_expires_at,
    user_id
)
VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING id;

-- name: GetSessionByAccessToken :one
SELECT * FROM sessions
WHERE access_token = $1
AND status = 'active'
LIMIT 1;

-- name: GetSessionByRefreshToken :one
SELECT * FROM sessions
WHERE refresh_token = $1
AND status = 'active'
LIMIT 1;

-- name: UpdateAccessToken :exec
UPDATE sessions
SET access_token = $1,
    expires_at = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $3
AND status = 'active';

-- name: UpdateLastAccessed :exec
UPDATE sessions
SET last_accessed_at = CURRENT_TIMESTAMP
WHERE id = $1
AND status = 'active';

-- name: RevokeSession :exec
UPDATE sessions
SET status = 'revoked',
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
AND status = 'active';

-- name: GetUserSessions :many
SELECT * FROM sessions
WHERE user_id = $1
AND status = 'active'
ORDER BY created_at DESC;

-- name: RevokeAllUserSessions :exec
UPDATE sessions
SET status = 'revoked',
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = $1
AND status = 'active';
