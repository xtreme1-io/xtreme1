# Schema migrations

Scripts here run at backend startup, in version order, once each. Flyway records what it has
applied in the `flyway_schema_history` table.

Versions 1 and 2 are not here. `deploy/mysql/migration/V1__Create_tables.sql` and
`V2__Init_data.sql` are mounted at `/docker-entrypoint-initdb.d`, and the MySQL image runs that
directory only when the data directory is empty — so they build the schema on a new installation
and never run again. Flyway adopts whatever it finds as version 2 (`baseline-version: 2` in
`application.yml`) and takes over from `V3` onwards. A new installation and an upgraded one
therefore reach the same schema through the same scripts.

Adding one:

- name it `V<n>__<short_description>.sql`, `<n>` being the next unused integer
- one concern per script, and no `DROP TABLE IF EXISTS` on a table that holds user data
- start the file with a comment saying how to undo it, because Flyway will not:

  ```sql
  -- Rollback: ALTER TABLE dataset DROP COLUMN description;
  ALTER TABLE `dataset` ADD COLUMN `description` varchar(255) DEFAULT NULL;
  ```

- a script that has already shipped in a release is immutable. Flyway checksums it and will
  refuse to start against a database where it ran with different contents. Fix it with a new
  version, never by editing the old file.

Back up before upgrading. `README.md`, "Upgrading", has the command; a failed migration leaves
the database where it stopped and the backend will refuse to start until it is resolved.
