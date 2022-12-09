package ai.basic.x1.adapter.api.controller;


import ai.basic.x1.usecase.DatasetSimilarityJobUseCase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author fyb
 * @date 2022-12-07
 */
@RestController
@RequestMapping("/datasetSimilarityJob")
public class DatasetSimilarityJobController {
    @Autowired
    private DatasetSimilarityJobUseCase datasetSimilarityJobUseCase;

    @PostMapping("/submitJob")
    public void submitJob(@RequestParam Long datasetId) {
        datasetSimilarityJobUseCase.submitJob(datasetId);
    }

}

