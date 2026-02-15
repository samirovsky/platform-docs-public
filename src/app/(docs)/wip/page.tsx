
import WorkInProgress from '@/components/work-in-progress';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function WipPage(props: Props) {
    const searchParams = await props.searchParams;
    const title = typeof searchParams.title === 'string' ? searchParams.title : 'Work in Progress';

    return (
        <WorkInProgress
            title={title}
            description="This page is currently under development."
        />
    );
}
