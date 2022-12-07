package ai.basic.x1.adapter.api.controller;


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

    @PostMapping("/gen")
    public void gen(@RequestParam Long datasetId) {
        datasetSimilarityRecordUseCase.generateDatasetSimilarityRecord(datasetId);
    }

    @GetMapping("/{datasetId}")
    public DatasetSimilarityRecordDTO getDatasetSimilarityRecord(@PathVariable("datasetId") Long datasetId) {
        return DefaultConverter.convert(datasetSimilarityRecordUseCase.getDatasetSimilarityRecord(datasetId), DatasetSimilarityRecordDTO.class);
    }

}

