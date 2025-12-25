import { FC, useMemo } from 'react';
import { Button, ButtonProps } from '../../Button';
import { Flex, FlexProps } from '../../Flex';
import { LayoutItemCountView } from '../../layout';

interface NitroCardTabsItemViewProps extends ButtonProps
{
    isActive?: boolean;
    count?: number;
}

export const NitroCardTabsItemView: FC<NitroCardTabsItemViewProps> = props =>
{
    const { isActive = false, count = 0, position = 'relative', classNames = [], children = null, ...rest } = props;

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'justify-content-center'];

        if(isActive) newClassNames.push('active');

        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ isActive, classNames ]);

    const getButtonVariant = useMemo(() =>
    {
        return isActive ? 'silver' : 'muted';
    }, [ isActive ]);

    return (
        <Button variant={ getButtonVariant } position={ position } classNames={ getClassNames } { ...rest }>
            <Flex style={ { fontSize: '12px' } } className="flex-shrink-0" center>
                { children }
            </Flex>
            { (count > 0) &&
                <LayoutItemCountView count={ count } /> }
        </Button>
    );
}
