package ai.basic.x1.util;

import ai.basic.x1.adapter.port.dao.mybatis.model.DataClassificationOption;
import ai.basic.x1.entity.DataAnnotationClassificationBO;
import ai.basic.x1.entity.enums.InputTypeEnum;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author zhujh
 */
@Slf4j
public class ClassificationUtils {


    public static List<DataClassificationOption> parse(List<DataAnnotationClassificationBO> dataAnnotations) {
        List<DataClassificationOption> results = new ArrayList<>();
        for (DataAnnotationClassificationBO dataAnnotation : dataAnnotations) {
            try {
                results.addAll(parse(dataAnnotation));
            } catch (Exception e) {
                log.error("parse classification option fail. " + e);
            }
        }
        return results;
    }

    private static List<DataClassificationOption> parse(DataAnnotationClassificationBO dataAnnotation) {
        var classification = dataAnnotation.getClassificationAttributes();
        if (classification == null) {
            return List.of();
        }
        var values = classification.getJSONArray("values");
        if (values != null) {
            var classificationNodes = JSONUtil.toList(values, ClassificationNode.class);
            var classificationNodeMap =
                    classificationNodes.stream().collect(Collectors.toUnmodifiableMap(ClassificationNode::getId,
                            t -> t));

            return classificationNodes.stream()
                    .filter(e -> e.isLeaf && !Objects.equals(e.getType(), InputTypeEnum.TEXT) && !Objects.equals(e.getType(), InputTypeEnum.LONG_TEXT))
                    .map(leafNode -> convert(leafNode, classificationNodeMap, dataAnnotation))
                    .flatMap(Collection::stream)
                    .collect(Collectors.toList());
        } else {
            return List.of();
        }
    }

    private static List<DataClassificationOption> convert(ClassificationNode leafNode, Map<String,
            ClassificationNode> classificationNodeMap, DataAnnotationClassificationBO dataAnnotation) {
        var results = new ArrayList<DataClassificationOption>();
        if (leafNode.value instanceof Collection) {
            Collection optionNames = (Collection) leafNode.value;
            for (Object optionName : optionNames) {
                var paths = new ArrayList<String>();
                findOptionPath(paths, leafNode, classificationNodeMap, new HashSet<>());
                results.add(DataClassificationOption.builder()
                        .datasetId(dataAnnotation.getDatasetId())
                        .dataId(dataAnnotation.getDataId())
                        .classificationId(dataAnnotation.getClassificationId())
                        .attributeId(leafNode.id)
                        .optionName((String) optionName)
                        .optionPath(paths)
                        .createdBy(dataAnnotation.getCreatedBy())
                        .createdAt(OffsetDateTime.now())
                        .build());
            }
        } else if (leafNode.value instanceof CharSequence) {
            var paths = new ArrayList<String>();
            findOptionPath(paths, leafNode, classificationNodeMap, new HashSet<>());
            results.add(DataClassificationOption.builder()
                    .datasetId(dataAnnotation.getDatasetId())
                    .dataId(dataAnnotation.getDataId())
                    .classificationId(dataAnnotation.getClassificationId())
                    .attributeId(leafNode.id)
                    .optionName((String) leafNode.value)
                    .optionPath(paths)
                    .createdBy(dataAnnotation.getCreatedBy())
                    .createdAt(OffsetDateTime.now()).build());
        } else {
            throw new IllegalArgumentException("classification leaf node value type is not " +
                    "support. " + leafNode.value.getClass());
        }
        return results;
    }

    private static void findOptionPath(List<String> paths, ClassificationNode node,
                                       Map<String, ClassificationNode> classificationNodeMap,
                                       Set<String> visitNodes) {

        if (node == null) {
            return;
        }
        if (visitNodes.contains(node.id)) {
            throw new IllegalArgumentException("classification value node has cycle.");
        }
        paths.add(node.name);
        if (StrUtil.isNotEmpty(node.pvalue)) {
            paths.add(node.pvalue);
        }
        visitNodes.add(node.id);
        if (StrUtil.isNotEmpty(node.pid)) {
            findOptionPath(paths, classificationNodeMap.get(node.pid), classificationNodeMap,
                    visitNodes);
        }
    }

    @Data
    private static class ClassificationNode {
        private String id;
        private String pid;
        private String pvalue;
        private String name;
        private Object value;
        private Boolean isLeaf;
        private InputTypeEnum type;
    }

}
