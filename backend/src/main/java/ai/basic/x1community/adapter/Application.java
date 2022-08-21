package ai.basic.x1community.adapter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @author Jagger Wang
 */
@SpringBootApplication(scanBasePackages = "ai.basic.x1community.adapter")
@Slf4j
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

}
