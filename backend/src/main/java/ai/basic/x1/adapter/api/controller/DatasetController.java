package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.*;
import ai.basic.x1.adapter.dto.request.DatasetRequestDTO;
import ai.basic.x1.adapter.exception.ApiException;
import ai.basic.x1.entity.DataInfoBO;
import ai.basic.x1.entity.DatasetBO;
import ai.basic.x1.entity.DatasetQueryBO;
import ai.basic.x1.entity.DatasetStatisticsBO;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.entity.enums.ToolTypeEnum;
import ai.basic.x1.usecase.*;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author fyb
 * @date 2022/2/16 15:52
 */
@RestController
@RequestMapping("/dataset/")
@Validated
public class DatasetController extends BaseDatasetController {

    @Autowired
    private DatasetUseCase datasetUsecase;

    @Autowired
    protected DataInfoUseCase dataInfoUsecase;

    @Autowired
    private DatasetClassUseCase datasetClassUseCase;

    @Autowired
    private DataAnnotationObjectUseCase dataAnnotationObjectUseCase;

    @Autowired
    private DataClassificationOptionUseCase dataClassificationOptionUseCase;


    @PostMapping("create")
    public DatasetDTO create(@RequestBody @Validated({DatasetRequestDTO.GroupInsert.class}) DatasetRequestDTO dto) {
        var datasetBO = datasetUsecase.create(DefaultConverter.convert(dto, DatasetBO.class));
        return DefaultConverter.convert(datasetBO, DatasetDTO.class);
    }

    @PostMapping("update/{id}")
    public void update(@PathVariable Long id, @RequestBody @Validated DatasetRequestDTO dto) {
        datasetUsecase.update(id, DefaultConverter.convert(dto, DatasetBO.class));
    }

    @PostMapping("delete/{id}")
    public void delete(@PathVariable Long id) {
        datasetUsecase.delete(id);
    }

    @GetMapping("findByPage")
    public Page<DatasetDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo,
                                       @RequestParam(defaultValue = "10") Integer pageSize,
                                       @Validated DatasetQueryDTO dto) {
        var queryBO = DefaultConverter.convert(dto, DatasetQueryBO.class);
        var datasetBOPage = datasetUsecase.findByPage(pageNo, pageSize, queryBO);
        var datasetBOList = datasetBOPage.getList();
        if (CollectionUtil.isEmpty(datasetBOList)) {
            return DefaultConverter.convert(datasetBOPage, DatasetDTO.class);
        }
        var datasetIds = datasetBOList.stream().map(datasetBO -> datasetBO.getId()).collect(Collectors.toList());
        var datasetStatisticsMap = dataInfoUsecase.getDatasetStatisticsByDatasetIds(datasetIds);
        var dataInfoBOList = new ArrayList<DataInfoBO>();
        datasetBOList.forEach(datasetBO -> {
            var datas = datasetBO.getDatas();
            if (!datasetBO.getType().equals(DatasetTypeEnum.IMAGE) && CollectionUtil.isNotEmpty(datas)) {
                dataInfoBOList.add(CollectionUtil.getFirst(datas));
            } else {
                dataInfoBOList.addAll(datas);
            }
        });
        var dataMap = dataInfoUsecase.getDataInfoListFileMap(dataInfoBOList);
        return datasetBOPage.convert(datasetBO -> {
            var datasetDTO = DefaultConverter.convert(datasetBO, DatasetDTO.class);
            var datasetStatisticsBO = datasetStatisticsMap.get(datasetBO.getId());
            if (ObjectUtil.isNotNull(datasetStatisticsBO)) {
                datasetDTO.setAnnotatedCount(datasetStatisticsBO.getAnnotatedCount());
                datasetDTO.setNotAnnotatedCount(datasetStatisticsBO.getNotAnnotatedCount());
                datasetDTO.setInvalidCount(datasetStatisticsBO.getInvalidCount());
                datasetDTO.setItemCount(datasetStatisticsBO.getItemCount());
            }
            var dataInfoBOS = dataMap.get(datasetBO.getId());
            if (CollectionUtil.isNotEmpty(dataInfoBOS)) {
                datasetDTO.setDatas(dataInfoBOS.stream().map(dataInfoBO -> convertDataInfoDTO(dataInfoBO)).collect(Collectors.toList()));
            }
            return datasetDTO;
        });
    }

    @GetMapping("info/{id}")
    public DatasetDTO info(@PathVariable Long id) {
        var datasetBO = datasetUsecase.findById(id);
        if (ObjectUtil.isEmpty(datasetBO)) {
            throw new ApiException(UsecaseCode.NOT_FOUND);
        }
        return DefaultConverter.convert(datasetBO, DatasetDTO.class);
    }

    @GetMapping("findOntologyIsExistByDatasetId")
    public Boolean findOntologyIsExistByDatasetId(@NotNull(message = "datasetId cannot be null") @RequestParam(required = false) Long datasetId) {
        return datasetUsecase.findOntologyIsExistByDatasetId(datasetId);
    }

    @GetMapping("{datasetId}/statistics/dataStatus")
    public DatasetStatisticsDTO statisticsDataStatus(@PathVariable("datasetId") Long datasetId) {
        var datasetStatisticsMap = dataInfoUsecase.getDatasetStatisticsByDatasetIds(List.of(datasetId));
        var objectCount = dataAnnotationObjectUseCase.countObjectByDatasetId(datasetId);
        var statisticsInfo = datasetStatisticsMap.getOrDefault(datasetId,
                DatasetStatisticsBO.createEmpty(datasetId));

        var result = DefaultConverter.convert(statisticsInfo, DatasetStatisticsDTO.class);
        result.setItemCount(statisticsInfo.getItemCount());
        result.setObjectCount(objectCount.intValue());
        return result;
    }

    @GetMapping("{datasetId}/statistics/classObject")
    public ClassStatisticsDTO statisticsClassObject(@PathVariable("datasetId") Long datasetId,
                                              @RequestParam(value = "pageNo", defaultValue = "1") Integer pageNo,
                                              @RequestParam(value = "pageSize", defaultValue = "100") Integer pageSize) {
        return ClassStatisticsDTO.builder()
                .toolTypeUnits(
                        DefaultConverter.convert(datasetClassUseCase.statisticsObjectByToolType(datasetId), ToolTypeStatisticsUnitDTO.class)
                )
                .classUnits(
                        DefaultConverter.convert(datasetClassUseCase.statisticObjectByClass(datasetId,
                                pageNo, pageSize), ClassStatisticsUnitDTO.class))
                .build();
    }

    @GetMapping("{datasetId}/statistics/classificationData")
    public List<DataClassificationOptionDTO> statisticsClassificationData(@PathVariable("datasetId") Long datasetId,
                                                                          @RequestParam(value = "pageNo", defaultValue = "1") Integer pageNo,
                                                                          @RequestParam(value = "pageSize", defaultValue = "100") Integer pageSize) {
        var results = dataClassificationOptionUseCase.statisticsDataByOption(datasetId, pageNo, pageSize);
        return DefaultConverter.convert(results, DataClassificationOptionDTO.class);
    }

}
