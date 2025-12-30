import { FC } from 'react';
import { Base, Column, Flex, Text } from '../../../../../common';
import { useCatalog } from '../../../../../hooks';
import { CatalogBadgeSelectorWidgetView } from '../widgets/CatalogBadgeSelectorWidgetView';
import { CatalogFirstProductSelectorWidgetView } from '../widgets/CatalogFirstProductSelectorWidgetView';
import { CatalogItemGridWidgetView } from '../widgets/CatalogItemGridWidgetView';
import { CatalogLimitedItemWidgetView } from '../widgets/CatalogLimitedItemWidgetView';
import { CatalogPurchaseWidgetView } from '../widgets/CatalogPurchaseWidgetView';
import { CatalogTotalPriceWidget } from '../widgets/CatalogTotalPriceWidget';
import { CatalogViewProductWidgetView } from '../widgets/CatalogViewProductWidgetView';
import { CatalogLayoutProps } from './CatalogLayout.types';

export const CatalogLayoutBadgeDisplayView: FC<CatalogLayoutProps> = props =>
{
    const { page = null } = props;
    const { currentOffer = null } = useCatalog();

    return (
        <>
            <CatalogFirstProductSelectorWidgetView />
            <Column gap={1} fullWidth fullHeight>
                { currentOffer &&
                    <Base className="catalog-item-preview" position="relative" overflow="hidden">
                        <Flex fullWidth className="position-absolute p-2" style={ { zIndex: 99 } }>
                            <Column fullWidth className="position-absolute p-2 bottom-0" style={ { zIndex: 99 } }>
                                <CatalogLimitedItemWidgetView fullWidth />
                                <Text fullWidth className="catalog-item-title" variant="white" truncate>{ currentOffer.localizationName }</Text>
                            </Column>
                        </Flex>
                        <CatalogViewProductWidgetView height={ 255 } />
                    </Base> 
                }
                <Flex gap={1} fullWidth overflow="hidden" grow>
                    <Column className="nitro-catalog-items-grid" fullWidth>
                        <CatalogItemGridWidgetView shrink />
                    </Column>
                    <Column className='nitro-catalog-items-grid' fullWidth gap={ 1 } overflow="hidden">
                        <CatalogBadgeSelectorWidgetView />
                    </Column>
                </Flex>
                { !currentOffer &&
                    <>
                        { !!page.localization.getImage(1) && <img alt="" src={ page.localization.getImage(1) } /> }
                        <Text center dangerouslySetInnerHTML={ { __html: page.localization.getText(0) } } />
                    </> }
                { currentOffer &&
                    <>
                        <Flex column className='mt-auto' gap={ 1 } justifyContent="end">
                            <Flex justifyContent="end">
                                <CatalogTotalPriceWidget alignItems="end" />
                            </Flex>
                            <CatalogPurchaseWidgetView />
                        </Flex>
                    </> }
            </Column>
        </>
    );
}
