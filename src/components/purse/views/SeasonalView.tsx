import { FC } from 'react';
import { GetConfiguration, LocalizeFormattedNumber } from '../../../api';
import { Flex, LayoutCurrencyIcon, Text } from '../../../common';

interface SeasonalViewProps
{
    type: number;
    amount: number;
}

export const SeasonalView: FC<SeasonalViewProps> = props =>
{
    const { type = -1, amount = -1 } = props;

    const currencyColors = GetConfiguration<{ [key: string]: string }>('currency.asset.colors', {});
    const currencyColor = currencyColors[type.toString()];
    const style = currencyColor ? { '--currency-color': currencyColor } as React.CSSProperties : {};

    return (
        <Flex fullWidth>
            <Flex justifyContent="end" alignItems="center" gap={ 1 } className="nitro-purse-container nitro-purse-button rounded w-100">
                <Text variant="white">{ LocalizeFormattedNumber(amount) }</Text>
                <Flex className="nitro-purse-button nitro-purse-currency" style={ style }>
                    <LayoutCurrencyIcon type={ type } />
                </Flex>
            </Flex>
        </Flex>
    );
}
