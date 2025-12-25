import { FC, useMemo } from 'react';
import { Base, BaseProps } from '..';

interface LayoutItemCountViewProps extends BaseProps<HTMLDivElement>
{
    count: number;
    light?: boolean;
    small?: boolean;
}

export const LayoutItemCountView: FC<LayoutItemCountViewProps> = props =>
{
    const { count = 0, light = false, small = false, position = 'absolute', classNames = [], children = null, ...rest } = props;

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'px-1', 'nitro-item-count' ];

        if(light) newClassNames.push('bg-light');

        if(!light) newClassNames.push('bg-danger', 'border', 'border-black', 'badge' );

        if(small) newClassNames.push('xs');

        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ light, small, classNames ]);

    return (
        <Base position="absolute" classNames={ getClassNames } { ...rest }>
            { count }
            { children }
        </Base>
    );
}
