import { Doc } from '@/schema/doc';

export const getIndex = () => {
  return [
    {
      id: 'changelog',
      url: '/resources/technical-reference/changelog',
      title: 'Changelog',
      description: 'Our latest updates',
      body: '',
      type: 'docs',
    } satisfies Doc,
  ];
};
