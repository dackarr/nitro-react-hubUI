import { FC, useEffect, useState } from 'react';
import { GetConfiguration, LocalizeText, ProductTypeEnum } from '../../../../../api';
import { Base, Column, Flex, LayoutImage, Text } from '../../../../../common';
import { useCatalog } from '../../../../../hooks';
import { CatalogHeaderView } from '../../catalog-header/CatalogHeaderView';
import { CatalogAddOnBadgeWidgetView } from '../widgets/CatalogAddOnBadgeWidgetView';
import { CatalogItemGridWidgetView } from '../widgets/CatalogItemGridWidgetView';
import { CatalogLimitedItemWidgetView } from '../widgets/CatalogLimitedItemWidgetView';
import { CatalogPurchaseWidgetView } from '../widgets/CatalogPurchaseWidgetView';
import { CatalogSpinnerWidgetView } from '../widgets/CatalogSpinnerWidgetView';
import { CatalogTotalPriceWidget } from '../widgets/CatalogTotalPriceWidget';
import { CatalogViewProductWidgetView } from '../widgets/CatalogViewProductWidgetView';
import { CatalogLayoutProps } from './CatalogLayout.types';

export const CatalogLayoutTrophiesView: FC<CatalogLayoutProps> = props =>
{
    const { page = null } = props;
    const [ trophyText, setTrophyText ] = useState<string>('');
    const { currentOffer = null, currentPage = null, setPurchaseOptions = null } = useCatalog();

    useEffect(() =>
    {
        if(!currentOffer) return;

        setPurchaseOptions(prevValue =>
        {
            const newValue = { ...prevValue };

            newValue.extraData = trophyText;

            return newValue;
        });
    }, [ currentOffer, trophyText, setPurchaseOptions ]);

    return (
        <Column fullHeight>
            { !currentOffer &&
                <Column className="catalog-item-preview" center overflow="hidden" shrink>
                    <Flex fullHeight>
                        { !!page.localization.getImage(1) && 
                            <LayoutImage imageUrl={ page.localization.getImage(1) } /> 
                        }
                        <Text center dangerouslySetInnerHTML={ { __html: page.localization.getText(0) } } />
                    </Flex>
                </Column> }
            { currentOffer &&
                <Base className="catalog-item-preview" overflow="hidden" shrink position="relative">
                    { (currentOffer.product.productType !== ProductTypeEnum.BADGE) &&
                        <>                                        
                            <Flex fullWidth className="position-absolute p-2" style={ { zIndex: 99 } }>
                                <Text fullWidth grow variant="white" truncate>{ currentOffer.localizationName }</Text>
                                <CatalogLimitedItemWidgetView fullWidth />
                            </Flex>
                            <CatalogViewProductWidgetView height={255} />
                            <CatalogAddOnBadgeWidgetView className="bg-muted rounded bottom-1 end-1" position="absolute" />
                        </> }
                    { (currentOffer.product.productType === ProductTypeEnum.BADGE) && <CatalogAddOnBadgeWidgetView className="scale-2" /> }
                </Base> }
            <Column className="nitro-catalog-items-grid" overflow="hidden" grow>
                { GetConfiguration('catalog.headers') &&
                    <CatalogHeaderView imageUrl={ currentPage.localization.getImage(0) }/> 
                }
                <CatalogItemGridWidgetView />
            </Column>
            <textarea className="flex-grow-1 h-75 form-control w-100" defaultValue={ trophyText || '' } onChange={ event => setTrophyText(event.target.value) } />
            { currentOffer ? ( 
                    <Column className='mt-auto' gap={ 1 }>
                        <Flex justifyContent="between">
                            <Flex gap={ 1 }>
                                <CatalogSpinnerWidgetView />
                            </Flex>
                            <CatalogTotalPriceWidget justifyContent="end" alignItems="end" />
                        </Flex>
                        <CatalogPurchaseWidgetView />
                    </Column> 
                ) : 
                ( 
                    <Flex center className='nitro-catalog-items-grid purchase-replacement p-1'>
                        <Text className='opacity-50' bold center>{LocalizeText('catalog.purchase.select.info')}</Text>
                    </Flex> 
                )
            }
        </Column>
    );
}
