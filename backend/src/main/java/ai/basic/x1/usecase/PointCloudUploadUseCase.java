package ai.basic.x1.usecase;

import ai.basic.x1.util.Constants;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.ReUtil;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.File;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class PointCloudUploadUseCase {

    @Autowired
    private UploadDataUseCase uploadDataUseCase;

    /**
     * 获取点云data的名称
     *
     * @param sceneFile 连续帧文件夹
     */
    public List<String> getDataNames(File sceneFile) {
        var sceneNames = new LinkedHashSet<String>();
        for (var f : sceneFile.listFiles()) {
            var filename = f.getName().toLowerCase();
            var boo = f.isDirectory() && ReUtil.isMatch(Constants.LIDAR_POINT_CLOUD_PATTERN, filename);
            if (boo) {
                var list = Arrays.stream(f.listFiles()).filter(fl -> Constants.PCD_SUFFIX.equalsIgnoreCase(FileUtil.getSuffix(fl))).map(uploadDataUseCase::getFilename).collect(Collectors.toSet());
                sceneNames.addAll(list);
            }
        }
        return sceneNames.stream().sorted().collect(Collectors.toList());
    }

    /**
     * 查找所有点云的文件夹
     *
     * @param path                 path
     * @param pointCloudParentList point_cloud文件夹父级目录集合
     */
    public void findPointCloudParentList(String path, Set<File> pointCloudParentList) {
        var file = new File(path);
        if (FileUtil.isDirectory(path)) {
            for (var f : file.listFiles()) {
                getPointCloudParentFile(f, pointCloudParentList);
                if (f.isDirectory()) {
                    findPointCloudParentList(f.getAbsolutePath(), pointCloudParentList);
                }
            }
        }
    }

    /**
     * 获取lidar_point_cloud或者radar_point_cloud上级目录
     *
     * @param file                 file
     * @param pointCloudParentList point_cloud文件夹父级目录集合
     */
    private void getPointCloudParentFile(File file, Set<File> pointCloudParentList) {
        var filename = file.getName().toLowerCase().trim();
        if (ReUtil.isMatch(Constants.LIDAR_POINT_CLOUD_PATTERN, filename) && FileUtil.isDirectory(file)) {
            pointCloudParentList.add(file.getParentFile());
        }
    }
}
