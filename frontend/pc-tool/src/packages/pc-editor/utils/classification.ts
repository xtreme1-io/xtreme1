import { IClassification, IClassificationAttr } from '../type';
import { AttrType } from 'pc-editor';

export function traverseClassification2Arr(data: any[]) {
    let classifications = [] as IClassification[];

    data.forEach((e: any) => {
        let classificationId = e.id + '';
        let classification: IClassification = {
            id: classificationId,
            name: e.name,
            label: e.name,
            attrs: [],
        };
        let options = e.options || [];
        let classificationAttr: IClassificationAttr = {
            classificationId,
            parent: '',
            parentValue: '',
            parentAttr: e.name,
            id: e.name,
            type: e.inputType,
            name: e.name,
            label: e.name,
            value: e.inputType === AttrType.MULTI_SELECTION ? [] : '',
            required: e.isRequired,
            options: options.map((e: any) => {
                return { value: e.name, label: e.name };
            }),
        };

        classification.attrs.push(classificationAttr);
        options.forEach((option: any) => {
            traverseOption(classification, option, classificationAttr.id, e.name);
        });
        classifications.push(classification);
    });

    return classifications;

    function traverseOption(
        classification: IClassification,
        option: any,
        parent: string,
        parentAttr: string,
    ) {
        if (!option.attributes || option.attributes.length === 0) return;

        option.attributes.forEach((attr: any) => {
            let name = attr.name;
            let classificationAttr: IClassificationAttr = {
                classificationId: classification.id,
                parent,
                parentAttr,
                parentValue: option.name,
                id: `${parent}[${option.name}]-${name}`,
                type: attr.type,
                name,
                label: name,
                value: attr.type === AttrType.MULTI_SELECTION ? [] : '',
                required: attr.required,
                options: attr.options.map((e: any) => {
                    return { value: e.name, label: e.name };
                }),
            };
            classification.attrs.push(classificationAttr);
            (attr.options || []).forEach((option: any) => {
                traverseOption(classification, option, classificationAttr.id, name);
            });
        });
    }
}

export function copyClassification(
    baseClassifications: IClassification[],
    valueMap: Record<string, any>,
) {
    let classifications = [] as IClassification[];
    baseClassifications.forEach((classification) => {
        let copyClassification = {} as IClassification;
        copyClassification = JSON.parse(JSON.stringify(classification));

        copyClassification.attrs.forEach((attr) => {
            attr.value = attr.type === AttrType.MULTI_SELECTION ? [] : '';
            if (valueMap[attr.id]) attr.value = valueMap[attr.id];
        });
        classifications.push(copyClassification);
    });
    return classifications;
}
