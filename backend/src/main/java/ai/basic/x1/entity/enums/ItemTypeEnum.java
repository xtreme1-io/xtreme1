package ai.basic.x1.entity.enums;

/**
 * @author fyb
 * @date 2023/10/26 14:13
 */
public enum ItemTypeEnum {

    SINGLE_DATA("Single Data"),

    SCENE("Scene");

    private String desc;

    private ItemTypeEnum(String desc) {
        this.desc = desc;
    }

    public String desc() {
        return desc;
    }
}
