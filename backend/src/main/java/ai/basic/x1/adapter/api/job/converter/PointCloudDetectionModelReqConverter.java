package ai.basic.x1.adapter.api.job.converter;

import ai.basic.x1.adapter.port.rpc.dto.DataInfo;
import ai.basic.x1.adapter.port.rpc.dto.PointCloudDetectionReqDTO;
import ai.basic.x1.entity.DataInfoBO;
import ai.basic.x1.entity.FileBO;
import ai.basic.x1.entity.ModelMessageBO;
import ai.basic.x1.entity.RelationFileBO;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static ai.basic.x1.util.Constants.*;

public class PointCloudDetectionModelReqConverter {

    private static final BigDecimal DEFAULT_CONFIDENCE = BigDecimal.valueOf(0);

    public static PointCloudDetectionReqDTO buildRequestParam(ModelMessageBO messageBo) {
        DataInfo dataInfo = buildDataInfo(messageBo.getDataInfo());
        return PointCloudDetectionReqDTO.builder()
                .datas(Arrays.asList(dataInfo))
                .build();
    }

    private static DataInfo buildDataInfo(DataInfoBO dataInfoBO) {
        if (ObjectUtil.isNotNull(dataInfoBO)) {
            DataInfo dataInfo = DataInfo.builder().id(dataInfoBO.getId()).build();
            List<DataInfoBO.FileNodeBO> content = dataInfoBO.getContent();
            if (ObjectUtil.isNotNull(content)) {
                content.forEach(fileNodeBO -> traverFile(fileNodeBO, dataInfo));
            }
            return dataInfo;
        }
        return null;
    }

    private static void traverFile(DataInfoBO.FileNodeBO fileNodeBO, DataInfo dataInfo) {
        if (FILE.equals(fileNodeBO.getType())) {
            String[] subPaths = fileNodeBO.getFile().getPath().split("\\/");
            if (subPaths.length == 1) {
                subPaths = fileNodeBO.getFile().getPath().split("\\\\");
            }
            String prePath = subPaths[subPaths.length - 2];
            //images
            if (prePath.startsWith(CAMERA_IMAGE)) {
                if (CollUtil.isEmpty(dataInfo.getImageUrls())) {
                    List<String> imageUrlList = new ArrayList<>();
                    imageUrlList.add(fileNodeBO.getFile().getUrl());
                    dataInfo.setImageUrls(imageUrlList);
                } else {
                    dataInfo.getImageUrls().add(fileNodeBO.getFile().getUrl());
                }
            }
            //pcd
            if (prePath.startsWith(LIDAR_POINT_CLOUD)) {
                dataInfo.setPointCloudUrl(getFileBO(fileNodeBO.getFile()).getUrl());
            }
            //cameraConfig
            if (prePath.startsWith(CAMERA_CONFIG)) {
                dataInfo.setCameraConfigUrl(fileNodeBO.getFile().getUrl());
            }
        }
        if (DIRECTORY.equals(fileNodeBO.getType()) && CollUtil.isNotEmpty(fileNodeBO.getFiles())) {
            for (DataInfoBO.FileNodeBO file : fileNodeBO.getFiles()) {
                traverFile(file, dataInfo);
            }
        }
    }


    private static FileBO getFileBO(RelationFileBO relationFileBO) {
        FileBO fileBO = DefaultConverter.convert(relationFileBO, FileBO.class);
        if (relationFileBO.getPath().toUpperCase().endsWith(PCD_SUFFIX)) {
            var relationFileBos = relationFileBO.getRelationFiles();
            if (CollectionUtil.isNotEmpty(relationFileBos)) {
                for (FileBO rf : relationFileBos) {
                    switch (rf.getRelation()) {
                        case BINARY:
                            fileBO = DefaultConverter.convert(rf, FileBO.class);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        return fileBO;
    }
}
