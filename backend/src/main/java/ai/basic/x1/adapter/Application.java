package ai.basic.x1.adapter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/**
 * @author Jagger Wang
 */
@SpringBootApplication(scanBasePackages = "ai.basic.x1.adapter", exclude = {UserDetailsServiceAutoConfiguration.class})
@Slf4j
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
