package ai.basic.x1.adapter.api.job;

import ai.basic.x1.adapter.api.job.converter.ModelResultConverter;
import ai.basic.x1.adapter.dto.ApiResult;
import ai.basic.x1.adapter.port.dao.ModelDataResultDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelClass;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelDataResult;
import ai.basic.x1.adapter.port.rpc.PreLabelModelHttpCaller;
import ai.basic.x1.adapter.port.rpc.dto.*;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.ModelCodeEnum;
import ai.basic.x1.usecase.ModelUseCase;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static ai.basic.x1.util.Constants.*;

/**
 * @author andy
 */
@Slf4j
public class PreLabelModelMessageHandler extends AbstractModelMessageHandler<List<PreModelRespDTO>> {

    @Autowired
    private PreLabelModelHttpCaller preLabelModelHttpCaller;

    @Autowired
    private ModelUseCase modelUseCase;

    private static final BigDecimal DEFAULT_CONFIDENCE = BigDecimal.valueOf(0);


    @Override
    public ModelTaskInfoBO modelRun(ModelMessageBO modelMessageBO) {
        ApiResult<List<PreModelRespDTO>> apiResult = getRetryAbleApiResult(modelMessageBO);
        Map<String, ModelClass> modelClassMap = modelUseCase.getModelClassMapByModelId(modelMessageBO.getModelId());
        PreLabelModelObjectBO preLabelModelObjectBO = ModelResultConverter.preModelResultConverter(apiResult,
                JSONUtil.toBean(modelMessageBO.getResultFilterParam(), PreModelParamBO.class), modelClassMap);
        return preLabelModelObjectBO;
    }

    @Override
    ApiResult<List<PreModelRespDTO>> callRemoteService(ModelMessageBO modelMessageBO) {
        ApiResult<List<PreModelRespDTO>> listApiResult = preLabelModelHttpCaller.callPreLabelModel(buildRequestParam(modelMessageBO),modelMessageBO.getUrl());
        return listApiResult;
    }

    @Override
    public ModelCodeEnum getModelCodeEnum() {
        return ModelCodeEnum.LIDAR_DETECTION;
    }

    private PreModelReqDTO buildRequestParam(ModelMessageBO messageBo) {
        DataInfo dataInfo = buildDataInfo(messageBo.getDataInfo());
        return PreModelReqDTO.builder()
                .datas(Arrays.asList(dataInfo))
                .params(PreModelParam.builder().confidence(DEFAULT_CONFIDENCE).build())
                .build();
    }

    private DataInfo buildDataInfo(DataInfoBO dataInfoBO) {
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

    private void traverFile(DataInfoBO.FileNodeBO fileNodeBO, DataInfo dataInfo) {
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


    private FileBO getFileBO(RelationFileBO relationFileBO) {
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
