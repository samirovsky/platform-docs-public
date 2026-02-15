import { Doc } from '@/schema/doc';

export const getIndex = () => {
  return [
    {
      id: 'models',
      url: '/products/ai-models',
      title: 'Models',
      description: 'Models',
      body: '',
      type: 'docs',
    } satisfies Doc,
  ];
};
