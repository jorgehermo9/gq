-- Add migration script here
CREATE TABLE share (
    id UUID PRIMARY KEY,
    json text NOT NULL,
    query text NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);
