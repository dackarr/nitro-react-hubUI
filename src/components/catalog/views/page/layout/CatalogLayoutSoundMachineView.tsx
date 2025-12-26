import { GetOfficialSongIdMessageComposer, MusicPriorities, OfficialSongIdMessageEvent } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { GetConfiguration, GetNitroInstance, LocalizeText, ProductTypeEnum, SendMessageComposer } from '../../../../../api';
import { Base, Button, Column, Flex, LayoutImage, Text } from '../../../../../common';
import { useCatalog, useMessageEvent } from '../../../../../hooks';
import { CatalogHeaderView } from '../../catalog-header/CatalogHeaderView';
import { CatalogAddOnBadgeWidgetView } from '../widgets/CatalogAddOnBadgeWidgetView';
import { CatalogItemGridWidgetView } from '../widgets/CatalogItemGridWidgetView';
import { CatalogLimitedItemWidgetView } from '../widgets/CatalogLimitedItemWidgetView';
import { CatalogPurchaseWidgetView } from '../widgets/CatalogPurchaseWidgetView';
import { CatalogSpinnerWidgetView } from '../widgets/CatalogSpinnerWidgetView';
import { CatalogTotalPriceWidget } from '../widgets/CatalogTotalPriceWidget';
import { CatalogViewProductWidgetView } from '../widgets/CatalogViewProductWidgetView';
import { CatalogLayoutProps } from './CatalogLayout.types';

export const CatalogLayoutSoundMachineView: FC<CatalogLayoutProps> = props =>
{
    const { page = null } = props;
    const [ songId, setSongId ] = useState(-1);
    const [ officialSongId, setOfficialSongId ] = useState('');
    const { currentOffer = null, currentPage = null } = useCatalog();

    const previewSong = (previewSongId: number) => GetNitroInstance().soundManager.musicController?.playSong(previewSongId, MusicPriorities.PRIORITY_PURCHASE_PREVIEW, 15, 0, 0, 0);

    useMessageEvent<OfficialSongIdMessageEvent>(OfficialSongIdMessageEvent, event =>
    {
        const parser = event.getParser();

        if(parser.officialSongId !== officialSongId) return;

        setSongId(parser.songId);
    });

    useEffect(() =>
    {
        if(!currentOffer) return;

        const product = currentOffer.product;

        if(!product) return;

        if(product.extraParam.length > 0)
        {
            const id = parseInt(product.extraParam);

            if(id > 0)
            {
                setSongId(id);
            }
            else
            {
                setOfficialSongId(product.extraParam);
                SendMessageComposer(new GetOfficialSongIdMessageComposer(product.extraParam));
            }
        }
        else
        {
            setOfficialSongId('');
            setSongId(-1);
        }

        return () => GetNitroInstance().soundManager.musicController?.stop(MusicPriorities.PRIORITY_PURCHASE_PREVIEW);
    }, [ currentOffer ]);

    useEffect(() =>
    {
        return () => GetNitroInstance().soundManager.musicController?.stop(MusicPriorities.PRIORITY_PURCHASE_PREVIEW);
    }, []);

    return (
        <>
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
                                <Text grow variant="white" className="position-absolute p-2" style={ { zIndex: 99 } } truncate>{ currentOffer.localizationName }</Text>
                                <CatalogViewProductWidgetView height={ 255 } />
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
                { currentOffer ? ( 
                        <Column className='mt-auto' gap={ 1 }>
                            <CatalogLimitedItemWidgetView fullWidth />
                            { songId > -1 && <Button onClick={ () => previewSong(songId) }>{ LocalizeText('play_preview_button') }</Button> }
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
        </>
    );
}
