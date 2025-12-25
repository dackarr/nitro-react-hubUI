import { FC, useEffect, useState } from 'react';
import { LocalizeBadgeDescription, LocalizeBadgeName, LocalizeText, UnseenItemCategory } from '../../../../api';
import { AutoGrid, Button, Column, Flex, Grid, LayoutBadgeImageView, LayoutGridItem, Text } from '../../../../common';
import { useInventoryBadges, useInventoryUnseenTracker } from '../../../../hooks';
import { InventoryBadgeItemView } from './InventoryBadgeItemView';

export const InventoryBadgeView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const { badgeCodes = [], activeBadgeCodes = [], selectedBadgeCode = null, isWearingBadge = null, canWearBadges = null, toggleBadge = null, getBadgeId = null, activate = null, deactivate = null } = useInventoryBadges();
    const { isUnseen = null, removeUnseen = null } = useInventoryUnseenTracker();

    useEffect(() =>
    {
        if(!selectedBadgeCode || !isUnseen(UnseenItemCategory.BADGE, getBadgeId(selectedBadgeCode))) return;

        removeUnseen(UnseenItemCategory.BADGE, getBadgeId(selectedBadgeCode));
    }, [ selectedBadgeCode, isUnseen, removeUnseen, getBadgeId ]);

    useEffect(() =>
    {
        if(!isVisible) return;

        const id = activate();

        return () => deactivate(id);
    }, [ isVisible, activate, deactivate ]);

    useEffect(() =>
    {
        setIsVisible(true);

        return () => setIsVisible(false);
    }, []);

    return (
        <Grid gap={ 1 }>
            <Column size={ 7 } overflow="hidden">
                <LayoutGridItem center={ false } pointer={ false } fullHeight fullWidth grow overflow="hidden" className="p-1">
                    <Column fullHeight fullWidth position="relative" gap={ 1 } overflow="y-scroll" className="overflow-x-hidden" style={ { paddingRight: 0 } } >
                        <AutoGrid overflow="hidden" style={ { marginRight: '2px' } } gap={ 1 } columnMinHeight={ 50 } columnMinWidth={ 50 } fullHeight={ false } className="layout-grid-row position-relative justify-content-center" columnCount={ 5 }>
                            { badgeCodes && (badgeCodes.length > 0) && badgeCodes.map((badgeCode, index) =>
                            {
                                if(isWearingBadge(badgeCode)) return null;

                                return <InventoryBadgeItemView key={ index } badgeCode={ badgeCode } />
                            }) }
                        </AutoGrid>
                    </Column>
                </LayoutGridItem>
            </Column>
            <Column className="justify-content-between layout-grid-item p-1" gap={ 2 } size={ 5 } overflow="auto">
                <Column overflow="hidden" fullHeight fullWidth gap={ 2 }>
                    <Text style={ { fontSize: '12px' } } fontWeight="bold">{ LocalizeText('inventory.badges.activebadges') }</Text>
                    <Flex column fullHeight fullWidth position="relative" className="overflow-y-scroll overflow-x-hidden" style={ { paddingRight: '0.rem' } }>
                        <AutoGrid overflow="hidden" gap={ 1 } className="layout-grid-row overflow-x-hidden" fullWidth columnCount={ 4 }>
                            { activeBadgeCodes && (activeBadgeCodes.length > 0) && activeBadgeCodes.map((badgeCode, index) => <InventoryBadgeItemView key={ index } badgeCode={ badgeCode } />) }
                        </AutoGrid>
                    </Flex>
                </Column>
                { !!selectedBadgeCode &&
                    <Column className="justify-content-end layout-grid-item layout-inner active p-1" grow justifyContent="end" gap={ 1 }>
                        <Flex alignItems="center" gap={ 2 }>
                            <LayoutBadgeImageView shrink badgeCode={ selectedBadgeCode } />
                            <Column gap={ 0 }>
                                <Text bold style={ { fontSize: '12px' } }>{ LocalizeBadgeName(selectedBadgeCode) }</Text>
                                <Text style={ { fontSize: '12px' } }>{ LocalizeBadgeDescription(selectedBadgeCode) }</Text>
                            </Column>
                        </Flex>
                        <Button variant={ (isWearingBadge(selectedBadgeCode) ? 'danger' : 'success') } disabled={ !isWearingBadge(selectedBadgeCode) && !canWearBadges() } onClick={ event => toggleBadge(selectedBadgeCode) }>{ LocalizeText(isWearingBadge(selectedBadgeCode) ? 'inventory.badges.clearbadge' : 'inventory.badges.wearbadge') }</Button>
                    </Column> }
            </Column>
        </Grid>
    );
}
