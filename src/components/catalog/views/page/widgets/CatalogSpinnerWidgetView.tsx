import { FC } from 'react';
import { LocalizeText } from '../../../../../api';
import { Base, Flex, Text } from '../../../../../common';
import { useCatalog } from '../../../../../hooks';

const MIN_VALUE: number = 1;
const MAX_VALUE: number = 100;

export const CatalogSpinnerWidgetView: FC<{}> = props =>
{
    const { currentOffer = null, purchaseOptions = null, setPurchaseOptions = null } = useCatalog();
    const { quantity = 1 } = purchaseOptions;

    const updateQuantity = (value: number) =>
    {
        if(isNaN(value)) value = 1;

        value = Math.max(value, MIN_VALUE);
        value = Math.min(value, MAX_VALUE);

        if(value === quantity) return;

        setPurchaseOptions(prevValue =>
        {
            const newValue = { ...prevValue };

            newValue.quantity = value;

            return newValue;
        });
    }

    if(!currentOffer || !currentOffer.bundlePurchaseAllowed) return null;

    return (
        <>
            <Flex className='quantity-counter px-1' alignItems="center" gap={ 1 }>
                <Text>{ LocalizeText('shop.amount.text.nocolon') }</Text>
                <Flex alignItems='center'>
                    <Base className="text-black cursor-pointer catalog-navigation-arrow left" onClick={ event => updateQuantity(quantity - 1) } />
                    <input type="number" className="form-control form-control-sm rounded quantity-input text-center" value={ quantity } onChange={ event => updateQuantity(event.target.valueAsNumber) } />
                    <Base className="text-black cursor-pointer catalog-navigation-arrow right" onClick={ event => updateQuantity(quantity + 1) } />
                </Flex>
            </Flex>
        </>
    );
}
