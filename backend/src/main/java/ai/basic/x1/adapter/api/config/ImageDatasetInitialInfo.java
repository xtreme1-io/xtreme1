package ai.basic.x1.adapter.api.config;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author fyb
 */
@Data
@SuperBuilder
@NoArgsConstructor
@Component
@ConfigurationProperties(prefix = "dataset-initial.dataset.image")
public class ImageDatasetInitialInfo extends DatasetInitialInfo{

}
