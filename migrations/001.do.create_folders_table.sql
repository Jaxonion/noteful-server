DROP TABLE IF EXISTS folders;

CREATE TABLE folders(
    folder_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL
);