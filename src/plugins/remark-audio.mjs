import { visit } from 'unist-util-visit';

export default function remarkAudioToComponent() {
    return (tree) => {
        visit(tree, (node) => {
            if (node.type === 'mdxJsxFlowElement' && node.name === 'audio') {
                node.name = 'Audio';
            }
        });
    };
}
