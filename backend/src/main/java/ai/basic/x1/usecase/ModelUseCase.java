package ai.basic.x1.usecase;

import ai.basic.x1.adapter.port.dao.ModelDAO;
import ai.basic.x1.adapter.port.dao.mybatis.model.Model;
import ai.basic.x1.adapter.port.dao.mybatis.model.ModelClass;
import ai.basic.x1.entity.ModelBO;
import ai.basic.x1.entity.ModelMessageBO;
import ai.basic.x1.util.Constants;
import ai.basic.x1.util.DefaultConverter;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.google.common.collect.Maps;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.stream.ObjectRecord;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author chenchao
 * @date 2022/8/26
 */
public class ModelUseCase {

    @Autowired
    private ModelDAO modelDAO;
    @Autowired
    private RedisTemplate<String, Object> streamRedisTemplate;

    public List<ModelBO> findAll(ModelBO modelBO) {
        LambdaQueryWrapper<Model> modelLambdaQueryWrapper = Wrappers.lambdaQuery();
        modelLambdaQueryWrapper.eq(ObjectUtil.isNotNull(modelBO.getDatasetType()), Model::getDatasetType, modelBO.getDatasetType());
        modelLambdaQueryWrapper.orderBy(true, true, Model::getName);
        var modelList = modelDAO.list(modelLambdaQueryWrapper);
        return DefaultConverter.convert(modelList, ModelBO.class);
    }

    public ModelBO findById(Long id) {
        var model = modelDAO.getById(id);
        return DefaultConverter.convert(model, ModelBO.class);
    }

    public Map<String, ModelClass> getModelClassMapByModelId(Long modelId) {
        Model model = modelDAO.getById(modelId);
        if (ObjectUtil.isNotNull(model)) {
            List<ModelClass> classes = model.getClasses();
            if (CollUtil.isNotEmpty(classes)) {
                List<ModelClass> modelClassesResult = new ArrayList<>();
                getModelClassList(classes, modelClassesResult);
                return modelClassesResult.stream().collect(Collectors.toMap(ModelClass::getCode, v -> v));
            }
        }
        return Maps.newHashMap();
    }

    private void getModelClassList(List<ModelClass> list, List<ModelClass> resultList) {
        if (CollUtil.isNotEmpty(list)) {
            for (ModelClass modelClass : list) {
                if (CollUtil.isNotEmpty(modelClass.getSubClasses())) {
                    getModelClassList(modelClass.getSubClasses(), resultList);
                } else {
                    resultList.add(modelClass);
                }
            }
        }
    }

    public RecordId sendModelMessageToMQ(ModelMessageBO modelMessageBO) {
        ObjectRecord<String, String> record = StreamRecords.newRecord()
                .in(Constants.MODEL_RUN_STREAM_KEY)
                .ofObject(JSONUtil.toJsonStr(modelMessageBO))
                .withId(RecordId.autoGenerate());
        return streamRedisTemplate.opsForStream().add(record);
    }
}
