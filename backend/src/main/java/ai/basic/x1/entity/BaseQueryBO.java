package ai.basic.x1.entity;

import lombok.Data;

@Data
public class BaseQueryBO {
    private Integer pageNo = 1;

    private Integer pageSize = 1000;
}
