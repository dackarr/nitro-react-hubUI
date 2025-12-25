import { FC } from 'react';
import { GetConfiguration, LocalizeText } from '../../../../../api';
import { Base, Column, Flex, LayoutImage, Text } from '../../../../../common';
import { useCatalog } from '../../../../../hooks';
import { CatalogHeaderView } from '../../catalog-header/CatalogHeaderView';
import { CatalogGuildBadgeWidgetView } from '../widgets/CatalogGuildBadgeWidgetView';
import { CatalogGuildSelectorWidgetView } from '../widgets/CatalogGuildSelectorWidgetView';
import { CatalogItemGridWidgetView } from '../widgets/CatalogItemGridWidgetView';
import { CatalogPurchaseWidgetView } from '../widgets/CatalogPurchaseWidgetView';
import { CatalogTotalPriceWidget } from '../widgets/CatalogTotalPriceWidget';
import { CatalogViewProductWidgetView } from '../widgets/CatalogViewProductWidgetView';
import { CatalogLayoutProps } from './CatalogLayout.types';

export const CatalogLayouGuildCustomFurniView: FC<CatalogLayoutProps> = props =>
{
    const { page = null } = props;
    const { currentOffer = null, currentPage = null } = useCatalog();
    
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
                    <Text grow variant="white" className="position-absolute p-2" style={ { zIndex: 99 } } truncate>{ currentOffer.localizationName }</Text>
                    <CatalogViewProductWidgetView height={255} />
                    <CatalogGuildBadgeWidgetView position="absolute" className="bottom-1 end-1" />
                </Base> }
            <Column className="nitro-catalog-items-grid" overflow="hidden" grow>
                { GetConfiguration('catalog.headers') &&
                    <CatalogHeaderView imageUrl={ currentPage.localization.getImage(0) }/> 
                }
                <CatalogItemGridWidgetView />
            </Column>
            { currentOffer ? ( 
                <Column className='mt-auto' gap={ 1 }>
                    <Base grow>
                        <CatalogGuildSelectorWidgetView />
                    </Base>
                    <Flex justifyContent="end">
                        <CatalogTotalPriceWidget alignItems="end" />
                    </Flex>
                    <CatalogPurchaseWidgetView />
                </Column>
            ) : ( 
                <Flex center className='nitro-catalog-items-grid p-1'>
                    <Text className='opacity-50' bold center>{LocalizeText('catalog.purchase.select.info')}</Text>
                </Flex> 
            ) }
        </Column>
    );
}
