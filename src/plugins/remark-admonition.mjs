import { visit } from 'unist-util-visit';

const SUPPORTED = new Set([
    'info',
    'note',
    'tip',
    'caution',
    'warning',
    'danger',
    'success',
]);

export default function admonitionDirective() {
    return (tree) => {
        visit(tree, (node) => {
            if (node.type !== 'containerDirective') return;
            const kind = String(node.name || '').toLowerCase();

            const normalized =
                kind === 'warn'
                    ? 'warning'
                    : kind === 'error'
                        ? 'danger'
                        : kind === 'title'
                            ? 'note'
                            : SUPPORTED.has(kind)
                                ? kind
                                : 'note';

            node.type = 'mdxJsxFlowElement';
            node.name = 'Admonition';

            const attrs = node.attributes || {};
            const props = Object.keys(attrs).map((name) => ({
                type: 'mdxJsxAttribute',
                name,
                value: String(attrs[name]),
            }));

            props.push({ type: 'mdxJsxAttribute', name: 'type', value: normalized });

            if (node.label) {
                props.push({
                    type: 'mdxJsxAttribute',
                    name: 'title',
                    value: String(node.label),
                });
            }

            node.attributes = props;
        });
    };
}
