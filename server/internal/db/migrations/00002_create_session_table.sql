-- +goose Up
-- +goose StatementBegin
CREATE TYPE session_status AS ENUM ('active', 'inactive', 'revoked');

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    access_token TEXT NOT NULL UNIQUE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    device_name VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status session_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS sessions;
DROP TYPE IF EXISTS session_status;
-- +goose StatementEnd
