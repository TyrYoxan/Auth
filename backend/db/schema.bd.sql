CREATE TABLE USERS(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(64)         NOT NULL
        CHECK (LENGTH(TRIM(name)) > 0),
    email       VARCHAR(128)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,
    role        VARCHAR(32)         NOT NULL DEFAULT 'viewer'
        CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer')),
    status      VARCHAR(32)         NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'banned', 'pending')),
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_token(
    id              UUID PRIMARY KEY    DEFAULT gen_random_uuid(),
    user_id         UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           TEXT                NOT NULL UNIQUE ,
    status          VARCHAR(32)         NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'revoked')),
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    date_expiration TIMESTAMPTZ         NOT NULL
);


/**
TRIGGER
*/
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

/**
  INDEX
*/
CREATE INDEX idx_refresh_tokens_user_id ON refresh_token(user_id);
CREATE INDEX idx_refresh_tokens_token   ON refresh_token(token);