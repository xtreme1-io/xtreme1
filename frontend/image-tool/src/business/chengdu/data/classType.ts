import { AttrType, IClassType } from 'editor';

const colors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
];

let classTypesConfig: IClassType[] = [
    {
        id: 1 + '',
        label: 'Car',
        name: 'Car',
        color: '',
        attrs: [
            { name: 'name', type: AttrType.TEXT, required: true, options: [] },
            {
                name: 'color',
                type: AttrType.DROPDOWN,
                required: true,
                options: [
                    { value: '#d62728', label: '#d62728' },
                    { value: '#9467bd', label: '#9467bd' },
                ],
            },
            {
                name: 'type',
                type: AttrType.MULTI_SELECTION,
                required: true,
                options: [
                    { value: 'Apple', label: 'Apple' },
                    { value: 'Orange', label: 'Orange' },
                    { value: 'Pear', label: 'Pear' },
                ],
            },
        ],
    },
    {
        id: 2 + '',
        label: 'Pedestrain',
        name: 'Pedestrain',
        color: '',
        attrs: [
            { name: 'name', type: AttrType.TEXT, required: true, options: [] },
            {
                name: 'type',
                type: AttrType.RADIO,
                required: true,
                options: [
                    { value: 'type1', label: 'type1' },
                    { value: 'type2', label: 'type2' },
                    { value: 'type3', label: 'type3' },
                ],
            },
        ],
    },
    {
        id: 3 + '',
        label: 'Bicycle',
        name: 'Bicycle',
        color: '',
        attrs: [
            { name: 'name', type: AttrType.TEXT, required: true, options: [] },
            {
                name: 'type',
                required: true,
                type: AttrType.DROPDOWN,
                options: [
                    { value: 'Apples', label: 'Apples' },
                    { value: 'Nails', label: 'Nails' },
                    { value: 'Bananas', label: 'Bananas' },
                    { value: 'Helicopters', label: 'Helicopters' },
                ],
            },
        ],
    },
];

classTypesConfig = classTypesConfig.map((e, index) => {
    return { ...e, color: colors[index] };
});

export { classTypesConfig, colors };
