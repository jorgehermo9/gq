CREATE TYPE data_type AS ENUM('json','yaml');

CREATE TABLE share (
    id UUID PRIMARY KEY,
    input_data text NOT NULL,
    input_type data_type NOT NULL,
    output_type data_type NOT NULL,
    query text NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);
