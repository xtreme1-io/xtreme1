package ai.basic.x1.adapter.dto.request;

import ai.basic.x1.entity.enums.ClassAndClassificationSourceEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author chenchao
 * @date 2022/12/12
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassAndClassificationImportReqDTO {

    private Long desId;

    private ClassAndClassificationSourceEnum desType;

    private MultipartFile file;
}
