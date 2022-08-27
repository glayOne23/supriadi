CREATE TABLE IF NOT EXISTS locations(
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR NOT NULL,
    "rule_id" VARCHAR NOT NULL, -- from twitter stream rule
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX index_locations_on_rule_id ON locations(rule_id);

CREATE TABLE IF NOT EXISTS users (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "username" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "phone" VARCHAR NOT NULL,
    "location_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT fk_users FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX index_users_on_username ON users(username);

CREATE TABLE IF NOT EXISTS suicidals (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "twitter_username" VARCHAR NOT NULL,
    "twitter_text" VARCHAR NOT NULL,
    "twitter_created_at" TIMESTAMP NOT NULL,
    "twitter_link" VARCHAR NOT NULL,
    "location_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT fk_suicidals FOREIGN KEY(location_id) REFERENCES locations(id) ON DELETE CASCADE
);
