package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.DataInfoDTO;
import ai.basic.x1.adapter.dto.FileDTO;
import ai.basic.x1.adapter.dto.ImageFileDTO;
import ai.basic.x1.adapter.dto.PcdFileDTO;
import ai.basic.x1.entity.DataInfoBO;
import ai.basic.x1.entity.FileBO;
import ai.basic.x1.entity.RelationFileBO;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;

import java.util.ArrayList;
import java.util.List;

import static ai.basic.x1.util.Constants.*;

/**
 * @author andy
 */
public abstract class BaseDatasetController {

    /**
     * Data info convert dataInfo dto
     *
     * @param dataInfoBO data
     * @return
     */
    protected DataInfoDTO convertDataInfoDTO(DataInfoBO dataInfoBO) {
        var dataInfoDTO = DefaultConverter.convert(dataInfoBO, DataInfoDTO.class);
        List<DataInfoDTO.FileNodeDTO> fileNodeDTOList = setFile(dataInfoBO.getContent());
        dataInfoDTO.setContent(fileNodeDTOList);
        return dataInfoDTO;
    }

    /**
     * Relation file convert file dto
     *
     * @param fileNodeBOList relation file list
     * @return
     */
    private List<DataInfoDTO.FileNodeDTO> setFile(List<DataInfoBO.FileNodeBO> fileNodeBOList) {
        List<DataInfoDTO.FileNodeDTO> fileNodeDTOList = new ArrayList<>();
        if (CollectionUtil.isNotEmpty(fileNodeBOList)) {
            fileNodeBOList.forEach(fileNodeBO -> {
                var fileNodeDTO = DefaultConverter.convert(fileNodeBO, DataInfoDTO.FileNodeDTO.class);
                if (fileNodeBO.getType().equals(FILE)) {
                    var file = fileNodeBO.getFile();
                    var fileDTO = convertFileDTO(file);
                    fileNodeDTO.setFile(fileDTO);
                } else {
                    fileNodeDTO.setFiles(setFile(fileNodeBO.getFiles()));
                }
                fileNodeDTOList.add(fileNodeDTO);
            });
        }
        return fileNodeDTOList;
    }


    /**
     * Relation file convert file dto
     *
     * @param relationFileBO relation file
     * @return
     */
    private FileDTO convertFileDTO(RelationFileBO relationFileBO) {
        FileDTO fileDTO = null;
        if (ObjectUtil.isNotNull(relationFileBO)) {
            if (IMAGE_DATA_TYPE.contains(relationFileBO.getType())) {
                fileDTO = DefaultConverter.convert(relationFileBO, ImageFileDTO.class);
            } else if (relationFileBO.getPath().toUpperCase().endsWith(PCD_SUFFIX)) {
                fileDTO = DefaultConverter.convert(relationFileBO, PcdFileDTO.class);
            } else {
                fileDTO = DefaultConverter.convert(relationFileBO, FileDTO.class);
            }
            var relationFileBos = relationFileBO.getRelationFiles();
            if (CollectionUtil.isNotEmpty(relationFileBos)) {
                for (FileBO rf : relationFileBos) {
                    var rfFileDTO = DefaultConverter.convert(rf, FileDTO.class);
                    switch (rf.getRelation()) {
                        case LARGE_THUMBTHUMBNAIL:
                            ((ImageFileDTO) fileDTO).setLargeThumbnail(rfFileDTO);
                            break;
                        case MEDIUM_THUMBTHUMBNAIL:
                            ((ImageFileDTO) fileDTO).setMediumThumbnail(rfFileDTO);
                            break;
                        case SMALL_THUMBTHUMBNAIL:
                            ((ImageFileDTO) fileDTO).setSmallThumbnail(rfFileDTO);
                            break;
                        case BINARY:
                            ((PcdFileDTO) fileDTO).setBinary(rfFileDTO);
                            break;
                        case BINARY_COMPRESSED:
                            ((PcdFileDTO) fileDTO).setBinaryCompressed(rfFileDTO);
                            break;
                        case POINT_CLOUD_RENDER_IMAGE:
                            ((PcdFileDTO) fileDTO).setRenderImage(rfFileDTO);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        return fileDTO;
    }
}
