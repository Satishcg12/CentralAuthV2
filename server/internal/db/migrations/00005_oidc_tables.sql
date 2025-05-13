-- +goose Up
-- +goose StatementBegin

-- Update clients table with OIDC fields
ALTER TABLE clients 
    ADD COLUMN oidc_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN allowed_scopes TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN allowed_grant_types TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN allowed_response_types TEXT[] NOT NULL DEFAULT '{}';

-- Create OIDC authorization codes table
CREATE TABLE oidc_auth_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    client_id VARCHAR(255) NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    redirect_uri TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scopes TEXT[] NOT NULL,
    code_challenge VARCHAR(255),
    code_challenge_method VARCHAR(10),
    used BOOLEAN NOT NULL DEFAULT FALSE,
    nonce VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create OIDC access tokens table
CREATE TABLE oidc_access_tokens (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    client_id VARCHAR(255) NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scopes TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create OIDC refresh tokens table
CREATE TABLE oidc_refresh_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    client_id VARCHAR(255) NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token_id INTEGER NOT NULL REFERENCES oidc_access_tokens(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scopes TEXT[] NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_oidc_auth_codes_client_id ON oidc_auth_codes(client_id);
CREATE INDEX idx_oidc_auth_codes_user_id ON oidc_auth_codes(user_id);
CREATE INDEX idx_oidc_access_tokens_client_id ON oidc_access_tokens(client_id);
CREATE INDEX idx_oidc_access_tokens_user_id ON oidc_access_tokens(user_id);
CREATE INDEX idx_oidc_refresh_tokens_client_id ON oidc_refresh_tokens(client_id);
CREATE INDEX idx_oidc_refresh_tokens_user_id ON oidc_refresh_tokens(user_id);
CREATE INDEX idx_oidc_refresh_tokens_access_token_id ON oidc_refresh_tokens(access_token_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS oidc_refresh_tokens;
DROP TABLE IF EXISTS oidc_access_tokens;
DROP TABLE IF EXISTS oidc_auth_codes;

-- Remove OIDC columns from clients table
ALTER TABLE clients 
    DROP COLUMN IF EXISTS oidc_enabled,
    DROP COLUMN IF EXISTS allowed_scopes,
    DROP COLUMN IF EXISTS allowed_grant_types,
    DROP COLUMN IF EXISTS allowed_response_types;
-- +goose StatementEnd
