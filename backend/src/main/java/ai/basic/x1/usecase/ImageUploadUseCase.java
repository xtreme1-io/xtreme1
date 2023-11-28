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

public class ImageUploadUseCase {

    @Autowired
    private UploadDataUseCase uploadDataUseCase;

    /**
     * 获取图片data的名称
     *
     * @param sceneFile 连续帧文件夹
     */
    public List<String> getDataNames(File sceneFile) {
        var sceneNames = new LinkedHashSet<String>();
        for (var f : sceneFile.listFiles()) {
            var filename = f.getName().toLowerCase();
            var boo = f.isDirectory() && ReUtil.isMatch(Constants.IMAGE_PATTERN, filename);
            if (boo) {
                var list = Arrays.stream(f.listFiles()).filter(fl -> Constants.IMAGE_DATA_TYPE.contains(FileUtil.getMimeType(fl.getAbsolutePath()))).map(uploadDataUseCase::getFilename).collect(Collectors.toSet());
                sceneNames.addAll(list);
            }
        }
        return sceneNames.stream().sorted().collect(Collectors.toList());
    }

    /**
     * 查找所有图片文件夹的父文件夹
     *
     * @param path path
     */
    public void findImageParentList(String path, Set<File> imageParentList) {
        var file = new File(path);
        if (FileUtil.isDirectory(path)) {
            for (var f : file.listFiles()) {
                getImageFile(f, imageParentList);
                if (f.isDirectory()) {
                    findImageParentList(f.getAbsolutePath(), imageParentList);
                }
            }
        }
    }

    /**
     * 获取image上级目录
     *
     * @param file            file
     * @param imageParentList image父文件夹集合
     */
    private void getImageFile(File file, Set<File> imageParentList) {
        var filename = FileUtil.getName(file).toLowerCase();
        if (ReUtil.isMatch(Constants.IMAGE_PATTERN, filename) && FileUtil.isDirectory(file)) {
            imageParentList.add(file.getParentFile());
        }
    }
}
