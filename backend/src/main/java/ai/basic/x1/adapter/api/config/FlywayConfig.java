package ai.basic.x1.adapter.api.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.MigrationInfoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Runs the schema migrations at startup and refuses to serve on a half-migrated schema.
 *
 * <p>Spring Boot would already abort the context if a migration failed. What it would not do is
 * say which version the database is on and which scripts did not run, which is the only thing an
 * operator needs at that moment. The database is left where Flyway left it: fix the script or
 * restore the backup described in README.md, then start the backend again.
 */
@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            var pending = pendingVersions(flyway);
            log.info("Schema migration: current version {}, pending {}", currentVersion(flyway),
                    pending.isEmpty() ? "none" : pending);
            try {
                flyway.migrate();
                log.info("Schema migration complete, now on version {}", currentVersion(flyway));
            } catch (Exception e) {
                log.error("Schema migration failed. The database is on version {} and these scripts did"
                        + " not complete: {}. The backend will not start on a half-migrated schema."
                        + " Restore the pre-upgrade backup (README.md, \"Upgrading\") before retrying.",
                        currentVersion(flyway), pending.isEmpty() ? "unknown" : pending, e);
                throw e;
            }
        };
    }

    private static String currentVersion(Flyway flyway) {
        try {
            MigrationInfo current = flyway.info().current();
            return current == null || current.getVersion() == null ? "none" : current.getVersion().toString();
        } catch (Exception e) {
            return "unreadable (" + e.getMessage() + ")";
        }
    }

    private static String pendingVersions(Flyway flyway) {
        try {
            MigrationInfoService info = flyway.info();
            return Arrays.stream(info.pending())
                    .map(m -> m.getVersion() + " " + m.getDescription())
                    .collect(Collectors.joining(", "));
        } catch (Exception e) {
            return "";
        }
    }
}
