package ai.basic.x1.adapter.api.controller;


import ai.basic.x1.adapter.dto.DatasetSimilarityDTO;
import ai.basic.x1.adapter.dto.DatasetSimilarityRecordDTO;
import ai.basic.x1.usecase.DatasetSimilarityRecordUseCase;
import ai.basic.x1.util.DefaultConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * @author fyb
 * @date 2022-12-05
 */
@RestController
@RequestMapping("/datasetSimilarityRecord")
public class DatasetSimilarityRecordController {

    @Autowired
    private DatasetSimilarityRecordUseCase datasetSimilarityRecordUseCase;


    @GetMapping("/{datasetId}")
    public DatasetSimilarityRecordDTO getDatasetSimilarityRecord(@PathVariable("datasetId") Long datasetId) {
        return DefaultConverter.convert(datasetSimilarityRecordUseCase.getDatasetSimilarityRecord(datasetId), DatasetSimilarityRecordDTO.class);
    }

    @GetMapping("/{datasetId}/{classificationId}")
    public DatasetSimilarityDTO getDatasetSimilarityRecordByClassificationId(@PathVariable("datasetId") Long datasetId, @PathVariable("classificationId") Long classificationId) {
        return DefaultConverter.convert(datasetSimilarityRecordUseCase.getDatasetSimilarityRecordByClassificationId(datasetId, classificationId), DatasetSimilarityDTO.class);
    }

}

