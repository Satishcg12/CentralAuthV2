-- name: GetUserById :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: GetUserByUsername :one
SELECT * FROM users
WHERE username = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: RegisterUser :exec
INSERT INTO users (
  username,
  email,
  password_hash,
  first_name,
  last_name,
  phone_number
) VALUES (
  $1, $2, $3, $4, $5, $6
)
RETURNING *;

-- name: GetUserByIdentifier :one
SELECT * FROM users
WHERE username = $1 OR email = $1 LIMIT 1;