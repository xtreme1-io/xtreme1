# Schema migrations

Scripts here run at backend startup, in version order, once each. Flyway records what it has
applied in the `flyway_schema_history` table.

Versions 1 and 2 are not here. `deploy/mysql/migration/V1__Create_tables.sql` and
`V2__Init_data.sql` are mounted at `/docker-entrypoint-initdb.d`, and the MySQL image runs that
directory only when the data directory is empty — so they build the schema on a new installation
and never run again. Flyway adopts whatever it finds as version 2 (`baseline-version: 2` in
`application.yml`) and takes over from `V3` onwards. A new installation and an upgraded one
therefore reach the same schema through the same scripts.

What `baseline-version: 2` asserts is that the database already holds the schema
`deploy/mysql/migration` builds today. That file last changed in v0.8.1, so it holds for any
installation from v0.8.1 (February 2024) onwards, which is what the upgrade instructions cover.
An older one is baselined at 2 while its schema is not the one version 2 describes — v0.6.x, for
instance, has no `LONG_TEXT` in `ontology_class.input_type`. Nothing detects this, and with no
scripts here yet nothing goes wrong; the first script that assumes a column will be the one that
finds out. Upgrade such an installation through v0.9.2 first, or check its schema by hand.

`baseline-on-migrate` only baselines a schema that is *not* empty. A database that exists but
holds no xtreme1 tables — an external MySQL, or a volume that predates the initdb mount — is
therefore not baselined at 2; Flyway reports `<< Empty Schema >>` and starts at V3, which fails
because the table it alters was never created. The backend then refuses to start, which is the
right outcome, but the error names the migration rather than the missing installation. The
bundled compose always runs V1/V2 from the MySQL entrypoint, so this is reachable only by
pointing the backend at a database something else was supposed to set up.

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

## When one fails

Back up before upgrading; `README.md`, "Upgrading", has the command.

A failed migration does not roll back. MySQL commits DDL statement by statement, so the
statements before the failing one stay applied while the history row records a failure. Flyway
then refuses every later start with "Detected failed migration to version N ... run repair",
and the backend never becomes healthy — it serves nothing, though the container does stay up.

Flyway's advice to run `repair` assumes a Flyway CLI, which this image does not carry. The
recovery is by hand, against the database:

```sql
-- 1. undo whatever the failed script managed to apply, statement by statement
ALTER TABLE `dataset` DROP COLUMN `probe`;
-- 2. clear the failed row, which is all `flyway repair` would have done here
DELETE FROM `flyway_schema_history` WHERE success = 0;
```

Then fix the script and start the backend again. This is why every script carries its rollback
comment, and why one script should do one thing: the shorter it is, the less there is to undo.

`flyway.version` in `backend/pom.xml` is pinned, with the reason in a comment there. It is not
a free upgrade.
