import { FC } from 'react';
import { LocalizeFormattedNumber } from '../../../api';
import { Flex, LayoutCurrencyIcon, Text } from '../../../common';

interface SeasonalViewProps
{
    type: number;
    amount: number;
}

export const SeasonalView: FC<SeasonalViewProps> = props =>
{
    const { type = -1, amount = -1 } = props;

    return (
        <Flex fullWidth>
            <Flex justifyContent="end" alignItems="center" gap={ 1 } className="nitro-purse-container nitro-purse-button rounded w-100">
                <Text variant="white">{ LocalizeFormattedNumber(amount) }</Text>
                <Flex className="nitro-purse-button nitro-purse-currency">
                    <LayoutCurrencyIcon type={ type } />
                </Flex>
            </Flex>
        </Flex>
    );
}
