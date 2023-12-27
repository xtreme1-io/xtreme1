package ai.basic.x1.usecase;

import ai.basic.x1.util.Constants;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.ReUtil;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.File;
import java.io.FileFilter;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class ImageUploadUseCase {

    @Autowired
    private UploadDataUseCase uploadDataUseCase;

    /**
     * Get the name of image data
     *
     * @param sceneFile Continuous frames folder
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
     * Find the parent folder of all picture folders
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
     * Get the upper-level directory of image
     *
     * @param file            file
     * @param imageParentList image parent folder collection
     */
    private void getImageFile(File file, Set<File> imageParentList) {
        var filename = FileUtil.getName(file).toLowerCase();
        if (ReUtil.isMatch(Constants.IMAGE_PATTERN, filename) && FileUtil.isDirectory(file)) {
            imageParentList.add(file.getParentFile());
        }
    }

    public List<File> findImageList(String path) {
        // Set the level to 100 to prevent the compressed package from having unlimited levels.
        return FileUtil.loopFiles(Paths.get(path), 100, imageFilter);
    }

    private final FileFilter imageFilter = file -> {
        // if the file extension is image return true, else false
        return Constants.IMAGE_DATA_TYPE.contains(FileUtil.getMimeType(file.getAbsolutePath()));
    };
}
