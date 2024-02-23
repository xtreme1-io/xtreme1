package ai.basic.x1.entity.enums;

public enum ObjectTypeEnum {
    THREE_D_BOX("3D_BOX"),
    TWO_D_BOX("2D_BOX"),

    TWO_RECT("2D_RECT"),
    BOUNDING_BOX("BOUNDING_BOX"),

    POLYLINE("POLYLINE"),

    POLYGON("POLYGON"),
    THREE_D_SEGMENT_POINTS("3D_SEGMENT_POINTS");

    private String value;

    ObjectTypeEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return this.value;
    }
}
