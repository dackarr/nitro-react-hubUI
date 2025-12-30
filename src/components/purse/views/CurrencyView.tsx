import { FC, useMemo } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { GetConfiguration, LocalizeFormattedNumber, LocalizeShortNumber } from '../../../api';
import { Flex, LayoutCurrencyIcon, Text } from '../../../common';

interface CurrencyViewProps
{
    type: number;
    amount: number;
    short: boolean;
}

export const CurrencyView: FC<CurrencyViewProps & { className?: string }> = props =>
{
    const { className = '', type = -1, amount = -1, short = false } = props;

    const element = useMemo(() =>
    {
        const currencyColors = GetConfiguration<{ [key: string]: string }>('currency.asset.colors', {});
        const currencyColor = currencyColors[type.toString()];
        const style = currencyColor ? { '--currency-color': currencyColor } as React.CSSProperties : {};

        return (
            <Flex fullWidth>
                <Flex justifyContent="end" pointer gap={ 1 } className="nitro-purse-container nitro-purse-button rounded w-100">
                    <Text truncate textEnd variant="white" grow>{ short ? LocalizeShortNumber(amount) : LocalizeFormattedNumber(amount) }</Text>
                    <Flex className="nitro-purse-currency currency" style={ style }>
                        <LayoutCurrencyIcon type={ type } />
                    </Flex>
                </Flex>
            </Flex>
            );
    }, [ amount, short, type ]);

    if(!short) return element;
    
    return (
        <OverlayTrigger
            placement="left"
            overlay={
                <Tooltip id={ `tooltip-${ type }` }>
                    { LocalizeFormattedNumber(amount) }
                </Tooltip>
            }>
            { element }
        </OverlayTrigger>
    );
}
