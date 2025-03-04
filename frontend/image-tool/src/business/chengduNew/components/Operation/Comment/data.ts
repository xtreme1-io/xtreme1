import { CommentType } from '@/business/chengduNew/config/comment';

export const stageTreeData: any[] = [
  {
    title: 'Select All',
    key: '0-0',
    children: [
      {
        title: 'Review1',
        key: '0-0-0',
      },
      {
        title: 'Review2',
        key: '0-0-1',
      },
    ],
  },
];

const types = [];
for (const key in CommentType) {
  const obj: any = {
    title: '',
    key: '',
  };
  obj.title = CommentType[key];
  obj.key = key;
  types.push(obj);
}
export const typeTreeData: any[] = [
  {
    title: 'Select all',
    key: 'All',
    children: [...types],
  },
];
