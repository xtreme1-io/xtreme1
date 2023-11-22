package ai.basic.basicai.common.entity.enums;

/**
 * @author chenchao
 * @date 2022/9/28
 */
public enum ItemTypeEnum {

    SINGLE_DATA("Single Data"),

    SCENE("Scene"),

    BATCH("Batch");

    private String desc;

    private ItemTypeEnum(String desc) {
        this.desc = desc;
    }

    public String desc() {
        return desc;
    }
}
