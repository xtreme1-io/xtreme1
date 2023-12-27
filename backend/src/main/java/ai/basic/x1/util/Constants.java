package ai.basic.x1.util;

import java.util.HashSet;
import java.util.Set;

/**
 * @author fyb
 */
public interface Constants {

    Long DEFAULT_PARENT_ID = 0L;

    String X_REAL_IP = "X-Real-Ip";

    String HOST = "Host";

    String X_UA = "X-User-Agent";

    String X_FORWARDED_FOR = "X-Forwarded-For";


    String X_FORWARDED_PROTO = "X-Forwarded-Proto";


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
     * scene
     */
    String SCENE = "scene_";

    /**
     * point_cloud
     */
    String POINT_CLOUD = "point_cloud";

    /**
     * lidar_point_cloud
     */
    String LIDAR_POINT_CLOUD = "lidar_point_cloud";

    String LIDAR_POINT_CLOUD_PATTERN = String.format("%s_\\d", LIDAR_POINT_CLOUD);

    /**
     * image
     */
    String POINT_CLOUD_IMG = "image";

    /**
     * image
     */
    String CAMERA_IMAGE = "camera_image";

    /**
     * camera_config
     */
    String CAMERA_CONFIG = "camera_config";

    /**
     * .PCD
     */
    String PCD_SUFFIX = "PCD";

    /**
     * .JSON
     */
    String JSON_SUFFIX = ".JSON";

    /**
     * image_
     */
    String IMAGE = "image_";

    /**
     * IMAGE_0
     */
    String IMAGE_0 = "image_0";

    /**
     * image_
     */
    String IMAGE_PATTERN = String.format("%s\\d", IMAGE);

    /**
     * image
     */
    String TEXT = "text";

    String RESULT = "result";

    String SLANTING_BAR = "/";

    String MINIO = "minio";

    String DATA = "data";


    String QUESTION_MARK = "?";

    Integer PROCESS_VALUE_SIZE = 1000;

    Integer BATCH_SIZE = 1000;

    Integer PAGE_NO = 1;

    Integer PAGE_SIZE = 1000;

    Integer PAGE_SIZE_100 = 100;

    String CONVERT_UPLOAD = "upload";

    String CONVERT_EXPORT = "export";

    /**
     * TIFF
     */
    String TIFF_SUFFIX = "TIFF";

    /**
     * TIF
     */
    String TIF_SUFFIX = "TIF";

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
        add("image/x-ms-bmp");
        add("image/webp");
        add("image/tiff");
    }};


    Set<String> DATA_TYPE = new HashSet<>() {{
        addAll(IMAGE_DATA_TYPE);
        addAll(COMPRESSED_DATA_TYPE);
    }};


    String DATA_MODEL_RUN_STREAM_KEY = "ai:basic:xtreme1:model:data:modelRun";

    String DATASET_MODEL_RUN_STREAM_KEY = "ai:basic:xtreme1:model:dataset:modelRun";

    String MODEL_RUN_CONSUMER_GROUP = "default-group";
    String MODEL_RUN_CONSUMER_NAME = "model-consumer";

    String DATASET_MODEL_RUN_CONSUMER_GROUP = "dataset-model-group";
    String DATASET_MODEL_RUN_CONSUMER_NAME = "dataset-model-consumer";

    String SIMILARITY_RESULT_PATH_FORMAT = "datasetSimilarity/result/%s";
    String SIMILARITY_SUBMIT_FILE_PATH_FORMAT = "datasetSimilarity/commit/%s";

    String MODEL_RUN_RESULT_CODE = "code";

    String MODEL_RUN_RESULT_MESSAGE = "message";

    String MODEL_RUN_RESULT_DATA = "data";

    String MODEL_RUN_RESULT_DATA_CODE = "data.code";

    String MODEL_RUN_RESULT_OBJECTS = "objects";
}
