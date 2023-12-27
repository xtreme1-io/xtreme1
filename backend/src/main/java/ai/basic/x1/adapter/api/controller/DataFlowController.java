package ai.basic.x1.adapter.api.controller;

import ai.basic.x1.entity.enums.DataStatusEnum;
import ai.basic.x1.usecase.DataFlowUseCase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author chenchao
 * @date 2022/8/26
 */
@RestController
@RequestMapping("/data/flow")
public class DataFlowController {

    @Autowired
    private DataFlowUseCase dataFlowUseCase;

    @PostMapping("/markAsInvalid/{dataId}")
    public void markAsInvalid(@PathVariable Long dataId){
        dataFlowUseCase.changeDataStatus(dataId, DataStatusEnum.INVALID);
    }

    @PostMapping("/markAsValid/{dataId}")
    public void markAsValid(@PathVariable Long dataId){
        dataFlowUseCase.changeDataStatus(dataId, DataStatusEnum.VALID);
    }

    @PostMapping("/submit/{itemId}")
    public void submit(@PathVariable Long itemId){
        dataFlowUseCase.submit(itemId);
    }
}
