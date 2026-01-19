import { uniqueHeadingId } from '@/lib/heading-utils';
import { getModelSlug, getModelUrl, models } from '@/schema';
import { Doc } from '@/schema/doc';

export const getIndex = () => {
  let used = new Set<string>();
  return models
    .filter(model => {
      const slug = getModelSlug(model);
      return (slug.includes('large') || slug.includes('pixtral-large')) && !slug.includes('small') && !slug.includes('codestral') && !slug.includes('ministral');
    })
    .map(
      model =>
        ({
          breadcrumbs: [
            { url: '/products/ai-models', title: 'Models' },
            { url: '/products/language-models/frontier-models', title: 'Frontier Models' },
            { url: getModelSlug(model), title: model.name },
          ],
          url: getModelUrl(model),
          title: model.name,
          body: model.description,
          tags: ['model'],
          id: uniqueHeadingId(getModelSlug(model), used),
          type: 'docs',
        }) satisfies Doc
    );
};
