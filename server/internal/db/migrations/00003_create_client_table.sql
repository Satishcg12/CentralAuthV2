-- +goose Up
-- +goose StatementBegin
CREATE TABLE clients (
  client_id UUID PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_secret_hash TEXT NOT NULL,
  redirect_uris TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  qr_login_enabled BOOLEAN DEFAULT false,
  oidc_enabled BOOLEAN DEFAULT false,
  token_lifespan INT DEFAULT 3600, -- seconds
  refresh_token_lifespan INT DEFAULT 2592000 -- 30 days
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS clients;
-- +goose StatementEnd
