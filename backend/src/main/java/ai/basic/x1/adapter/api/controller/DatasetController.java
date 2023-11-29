package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.*;
import ai.basic.x1.adapter.dto.request.DatasetRequestDTO;
import ai.basic.x1.adapter.exception.ApiException;
import ai.basic.x1.entity.*;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.entity.enums.ScenarioQuerySourceEnum;
import ai.basic.x1.usecase.*;
import ai.basic.x1.usecase.exception.UsecaseCode;
import ai.basic.x1.util.DefaultConverter;
import ai.basic.x1.util.Page;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.ObjectUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Collections;
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
    private DatasetUseCase datasetUseCase;

    @Autowired
    protected DataInfoUseCase dataInfoUsecase;

    @Autowired
    private DatasetClassUseCase datasetClassUseCase;

    @Autowired
    private DataClassificationOptionUseCase dataClassificationOptionUseCase;

    @Autowired
    private ClassUseCase classUseCase;


    @PostMapping("create")
    public DatasetDTO create(@RequestBody @Validated({DatasetRequestDTO.GroupInsert.class}) DatasetRequestDTO dto) {
        var datasetBO = datasetUseCase.create(DefaultConverter.convert(dto, DatasetBO.class));
        return DefaultConverter.convert(datasetBO, DatasetDTO.class);
    }

    @PostMapping("update/{id}")
    public void update(@PathVariable Long id, @RequestBody @Validated DatasetRequestDTO dto) {
        datasetUseCase.update(id, DefaultConverter.convert(dto, DatasetBO.class));
    }

    @PostMapping("delete/{id}")
    public void delete(@PathVariable Long id) {
        datasetUseCase.delete(id);
    }

    @GetMapping("findByType")
    public List<DatasetDTO> findByType(@NotEmpty(message = "datasetTypes cannot be null") @RequestParam(required = false) List<DatasetTypeEnum> datasetTypes) {
        return DefaultConverter.convert(datasetUseCase.findByType(datasetTypes), DatasetDTO.class);
    }

    @GetMapping("findByPage")
    public Page<DatasetDTO> findByPage(@RequestParam(defaultValue = "1") Integer pageNo,
                                       @RequestParam(defaultValue = "10") Integer pageSize,
                                       @Validated DatasetQueryDTO dto) {
        var queryBO = DefaultConverter.convert(dto, DatasetQueryBO.class);
        var datasetBOPage = datasetUseCase.findByPage(pageNo, pageSize, queryBO);
        var datasetBOList = datasetBOPage.getList();
        if (CollectionUtil.isEmpty(datasetBOList)) {
            return DefaultConverter.convert(datasetBOPage, DatasetDTO.class);
        }
        var datasetIds = datasetBOList.stream().map(datasetBO -> datasetBO.getId()).collect(Collectors.toList());
        var datasetStatisticsMap = dataInfoUsecase.getDatasetStatisticsByDatasetIds(datasetIds);
        dataInfoUsecase.setDatasetSixData(datasetBOList);
        return datasetBOPage.convert(datasetBO -> {
            var datasetDTO = DefaultConverter.convert(datasetBO, DatasetDTO.class);
            var datasetStatisticsBO = datasetStatisticsMap.get(datasetBO.getId());
            if (ObjectUtil.isNotNull(datasetStatisticsBO)) {
                datasetDTO.setAnnotatedCount(datasetStatisticsBO.getAnnotatedCount());
                datasetDTO.setNotAnnotatedCount(datasetStatisticsBO.getNotAnnotatedCount());
                datasetDTO.setInvalidCount(datasetStatisticsBO.getInvalidCount());
                datasetDTO.setItemCount(datasetStatisticsBO.getItemCount());
            }
            if (CollectionUtil.isNotEmpty(datasetBO.getDatas())) {
                var dataInfoDTOS = new ArrayList<DataInfoDTO>();
                datasetBO.getDatas().forEach(dataInfoBO -> dataInfoDTOS.add(convertDataInfoDTO(dataInfoBO)));
                datasetDTO.setDatas(dataInfoDTOS);
            }
            return datasetDTO;
        });
    }

    @GetMapping("info/{id}")
    public DatasetDTO info(@PathVariable Long id) {
        var datasetBO = datasetUseCase.findById(id);
        if (ObjectUtil.isEmpty(datasetBO)) {
            throw new ApiException(UsecaseCode.NOT_FOUND);
        }
        return DefaultConverter.convert(datasetBO, DatasetDTO.class);
    }

    @GetMapping("findOntologyIsExistByDatasetId")
    public Boolean findOntologyIsExistByDatasetId(@NotNull(message = "datasetId cannot be null") @RequestParam(required = false) Long datasetId) {
        return datasetUseCase.findOntologyIsExistByDatasetId(datasetId);
    }

    @GetMapping("{datasetId}/statistics/dataStatus")
    public DatasetStatisticsDTO statisticsDataStatus(@PathVariable("datasetId") Long datasetId) {
        var datasetStatisticsMap = dataInfoUsecase.getDatasetStatisticsByDatasetIds(List.of(datasetId));
        var objectCount = datasetUseCase.countObject(datasetId);
        var statisticsInfo = datasetStatisticsMap.getOrDefault(datasetId,
                DatasetStatisticsBO.createEmpty(datasetId));

        var result = DefaultConverter.convert(statisticsInfo, DatasetStatisticsDTO.class);
        result.setItemCount(statisticsInfo.getItemCount());
        result.setObjectCount(objectCount.intValue());
        return result;
    }

    @GetMapping("{datasetId}/statistics/classObject")
    public ClassStatisticsDTO statisticsClassObject(@PathVariable("datasetId") Long datasetId) {
        return ClassStatisticsDTO.builder()
                .toolTypeUnits(
                        DefaultConverter.convert(datasetClassUseCase.statisticsObjectByToolType(datasetId), ToolTypeStatisticsUnitDTO.class)
                )
                .classUnits(
                        DefaultConverter.convert(datasetClassUseCase.statisticObjectByClass(datasetId), ClassStatisticsUnitDTO.class))
                .build();
    }

    @GetMapping("{datasetId}/statistics/classificationData")
    public List<DataClassificationOptionDTO> statisticsClassificationData(@PathVariable("datasetId") Long datasetId) {
        var results = dataClassificationOptionUseCase.statisticsDataByOption(datasetId);
        return DefaultConverter.convert(results, DataClassificationOptionDTO.class);
    }

    @PostMapping("createByScenario")
    public void createByScenario(@RequestBody @Validated DatasetScenarioDTO dto) {
        var datasetScenarioBO = DefaultConverter.convert(dto, DatasetScenarioBO.class);
        if (dto.getSource().equals(ScenarioQuerySourceEnum.ONTOLOGY.name())) {
            var datasetClassIds = classUseCase.findDatasetClassIdsByClassId(dto.getClassId());
            if (CollectionUtil.isEmpty(datasetClassIds)) {
                throw new ApiException(UsecaseCode.DATASET_DATA_SCENARIO_NOT_FOUND);
            }
            datasetScenarioBO.setClassIds(datasetClassIds);
        } else {
            datasetScenarioBO.setClassIds(Collections.singletonList(dto.getClassId()));
        }
        datasetScenarioBO.setOntologyClassId(dto.getClassId());
        datasetUseCase.createByScenario(datasetScenarioBO);
    }

}
