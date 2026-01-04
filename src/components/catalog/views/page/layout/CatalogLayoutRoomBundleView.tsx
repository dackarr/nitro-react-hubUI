import { FC } from 'react';
import { Base, Column, LayoutImage, Text } from '../../../../../common';
import { CatalogAddOnBadgeWidgetView } from '../widgets/CatalogAddOnBadgeWidgetView';
import { CatalogBundleGridWidgetView } from '../widgets/CatalogBundleGridWidgetView';
import { CatalogFirstProductSelectorWidgetView } from '../widgets/CatalogFirstProductSelectorWidgetView';
import { CatalogPurchaseWidgetView } from '../widgets/CatalogPurchaseWidgetView';
import { CatalogSimplePriceWidgetView } from '../widgets/CatalogSimplePriceWidgetView';
import { CatalogLayoutProps } from './CatalogLayout.types';

export const CatalogLayoutRoomBundleView: FC<CatalogLayoutProps> = props =>
{
    const { page = null } = props;

    return (
        <>
            <CatalogFirstProductSelectorWidgetView />
            <Column overflow='hidden' fullHeight>
                <Base className="catalog-item-preview" overflow="hidden" shrink position="relative">
                    { !!page.localization.getImage(1) &&
                        <LayoutImage className="flex-grow-1" imageUrl={ page.localization.getImage(1) } /> }
                    <CatalogAddOnBadgeWidgetView position="absolute" className="nitro-catalog-items-grid rounded bottom-1 start-1" />
                    <CatalogSimplePriceWidgetView position="absolute" className="bottom-1 end-1" />
                </Base>
                <Column className="nitro-catalog-items-grid" overflow="hidden" grow>
                    { !!page.localization.getText(2) &&
                        <Text dangerouslySetInnerHTML={ { __html: page.localization.getText(2) } } /> }
                    <CatalogBundleGridWidgetView fullWidth className="nitro-catalog-layout-bundle-grid" />
                </Column>
                <Column className='mt-auto' gap={ 1 }>
                    { !!page.localization.getText(1) &&
                        <Text center small overflow="auto">{ page.localization.getText(1) }</Text> }
                    <CatalogPurchaseWidgetView />
                </Column>
            </Column>
        </>
    );
}
