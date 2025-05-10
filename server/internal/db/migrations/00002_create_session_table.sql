-- +goose Up
-- +goose StatementBegin
CREATE TYPE session_status AS ENUM ('active', 'inactive', 'revoked');

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    device_name VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    status session_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_logout BOOLEAN NOT NULL DEFAULT FALSE,
    last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS sessions;
DROP TYPE IF EXISTS session_status;
-- +goose StatementEnd
