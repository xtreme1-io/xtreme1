package ai.basic.x1.adapter.api.job.converter;

import ai.basic.x1.adapter.port.rpc.dto.DataInfo;
import ai.basic.x1.adapter.port.rpc.dto.ImageInfo;
import ai.basic.x1.adapter.port.rpc.dto.PreModelParam;
import ai.basic.x1.adapter.port.rpc.dto.PreModelReqDTO;
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
import static ai.basic.x1.util.Constants.PCD_SUFFIX;

public class PointCloudDetectionModelReqConverter {

    private static final BigDecimal DEFAULT_CONFIDENCE = BigDecimal.valueOf(0);

    public static PreModelReqDTO buildRequestParam(ModelMessageBO messageBo) {
        DataInfo dataInfo = buildDataInfo(messageBo.getDataInfo());
        return PreModelReqDTO.builder()
                .datas(Arrays.asList(dataInfo))
                .params(PreModelParam.builder().confidence(DEFAULT_CONFIDENCE).build())
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
            if (prePath.startsWith(POINT_CLOUD_IMG)) {
                if (CollUtil.isEmpty(dataInfo.getImages())) {
                    List<ImageInfo> imageInfoList = new ArrayList<>();
                    imageInfoList.add(ImageInfo.builder()
                            .name(fileNodeBO.getFile().getName())
                            .url(fileNodeBO.getFile().getInternalUrl())
                            .build());
                    dataInfo.setImages(imageInfoList);
                } else {
                    dataInfo.getImages().add(ImageInfo.builder()
                            .name(fileNodeBO.getFile().getName())
                            .url(fileNodeBO.getFile().getInternalUrl())
                            .build());
                }
            }
            //pcd
            if (prePath.startsWith(POINT_CLOUD)) {
                dataInfo.setPointCloudFile(getFileBO(fileNodeBO.getFile()).getInternalUrl());
            }
            //cameraConfig
            if (prePath.startsWith(CAMERA_CONFIG)) {
                dataInfo.setCameraConfig(fileNodeBO.getFile().getInternalUrl());
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
