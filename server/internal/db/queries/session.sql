-- name: CreateSession :one
INSERT INTO sessions (
    access_token,
    refresh_token,
    token_family,
    device_name,
    ip_address,
    user_agent,
    expires_at,
    previous_token_id,
    user_id
)
VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING id;
