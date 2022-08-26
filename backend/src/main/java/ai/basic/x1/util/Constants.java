package ai.basic.x1.util;

import java.util.HashSet;
import java.util.Set;

public interface Constants {

    String X_REAL_IP = "X-Real-Ip";

    String X_HOST = "X-Host";

    String X_UA = "X-User-Agent";

    String X_FORWARDED_FOR = "X-Forwarded-For";

    String FILE = "file";

    String DIRECTORY = "directory";

    /**
     * .TAR
     **/
    String TAR = ".TAR";

    /**
     * .TAR.GZ
     **/
    String TAR_GZ = ".TAR.GZ";

    /**
     * .TAR.BZ2
     **/
    String TAR_BZ2 = ".TAR.BZ2";

    /**
     * .ZIP
     **/
    String ZIP = ".ZIP";

    /**
     * __MACOSX
     */
    String MACOSX = "__MACOSX";

    /**
     * point_cloud
     */
    String POINT_CLOUD = "point_cloud";

    /**
     * image
     */
    String POINT_CLOUD_IMG = "image";

    /**
     * camera_config
     */
    String CAMERA_CONFIG = "camera_config";

    /**
     * .PCD
     */
    String PCD_SUFFIX = ".PCD";

    /**
     * .JSON
     */
    String JSON_SUFFIX = ".JSON";

    String RESULT = "RESULTS";

    Integer BATCH_SIZE = 1000;


    Set<String> COMPRESSED_DATA_TYPE = new HashSet<>() {{
        add("application/zip");
        add("application/x-rar");
        add("application/x-tar");
        add("application/x-gtar");
    }};

    Set<String> IMAGE_DATA_TYPE = new HashSet<>() {{
        add("image/jpg");
        add("image/png");
        add("image/jpeg");
        add("image/bmp");
    }};



    Set<String> DATA_TYPE = new HashSet<>() {{
        addAll(IMAGE_DATA_TYPE);
        addAll(COMPRESSED_DATA_TYPE);
    }};

}
