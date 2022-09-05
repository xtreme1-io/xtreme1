package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.adapter.dto.DatasetDTO;
import ai.basic.x1.adapter.dto.DatasetQueryDTO;
import ai.basic.x1.adapter.dto.request.DatasetRequestDTO;
import ai.basic.x1.adapter.exception.ApiException;
import ai.basic.x1.entity.DataInfoBO;
import ai.basic.x1.entity.DatasetBO;
import ai.basic.x1.entity.DatasetQueryBO;
import ai.basic.x1.entity.enums.DatasetTypeEnum;
import ai.basic.x1.usecase.DataInfoUseCase;
import ai.basic.x1.usecase.DatasetUseCase;
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
import java.util.stream.Collectors;

/**
 * @author fyb
 * @date 2022/2/16 15:52
 */
@RestController
@RequestMapping("/dataset/")
@Validated
public class DatasetController extends DatasetBaseController {

    @Autowired
    private DatasetUseCase datasetUsecase;

    @Autowired
    protected DataInfoUseCase dataInfoUsecase;


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

}
