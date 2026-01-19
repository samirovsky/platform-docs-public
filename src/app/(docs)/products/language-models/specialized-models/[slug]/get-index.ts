import { uniqueHeadingId } from '@/lib/heading-utils';
import { getModelSlug, getModelUrl, models } from '@/schema';
import { Doc } from '@/schema/doc';

export const getIndex = () => {
  let used = new Set<string>();
  return models
    .filter(model => {
      const slug = getModelSlug(model);
      // Catch-all for specialized: Codestral, Small, Nemo, Embed, OCR, Mathstral
      return (slug.includes('codestral') || slug.includes('small') || slug.includes('nemo') || slug.includes('embed') || slug.includes('ocr') || slug.includes('mathstral') || slug.includes('moderation')) && !slug.includes('7b');
    })
    .map(
      model =>
        ({
          breadcrumbs: [
            { url: '/products/ai-models', title: 'Models' },
            { url: '/products/language-models/specialized-models', title: 'Specialized Models' },
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
