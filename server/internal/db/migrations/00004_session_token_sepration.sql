-- +goose Up
-- +goose StatementBegin

-- Create refresh tokens table
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    client_id VARCHAR(255),  -- NULL for SSO scenarios
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create access tokens table
CREATE TABLE access_tokens (
    id SERIAL PRIMARY KEY,
    refresh_token_id INTEGER NOT NULL REFERENCES refresh_tokens(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS access_tokens;
DROP TABLE IF EXISTS refresh_tokens;
-- +goose StatementEnd
