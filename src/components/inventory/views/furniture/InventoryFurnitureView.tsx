import { IRoomSession, RoomObjectVariable, RoomPreviewer, Vector3d } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { attemptItemPlacement, DispatchUiEvent, FurniCategory, GetRoomEngine, GetSessionDataManager, GroupItem, LocalizeText, UnseenItemCategory } from '../../../../api';
import
    {
        AutoGrid,
        Button,
        Column,
        Grid,
        LayoutGridItem,
        LayoutLimitedEditionCompactPlateView,
        LayoutRarityLevelView,
        LayoutRoomPreviewerView,
        Text
    } from '../../../../common';
import { CatalogPostMarketplaceOfferEvent } from '../../../../events';
import { useInventoryFurni, useInventoryUnseenTracker } from '../../../../hooks';
import { InventoryCategoryEmptyView } from '../InventoryCategoryEmptyView';
import { InventoryFurnitureItemView } from './InventoryFurnitureItemView';
import { InventoryFurnitureSearchView } from './InventoryFurnitureSearchView';

interface InventoryFurnitureViewProps
{
    roomSession: IRoomSession;
    roomPreviewer: RoomPreviewer;
}

const attemptPlaceMarketplaceOffer = (groupItem: GroupItem) =>
{
    const item = groupItem.getLastItem();

    if(!item) return false;

    if(!item.sellable) return false;

    DispatchUiEvent(new CatalogPostMarketplaceOfferEvent(item));
}

export const InventoryFurnitureView: FC<InventoryFurnitureViewProps> = props =>
{
    const { roomSession = null, roomPreviewer = null } = props;
    const [ isVisible, setIsVisible ] = useState(false);
    const [ filteredGroupItems, setFilteredGroupItems ] = useState<GroupItem[]>([]);
    const [ description, setDescription ] = useState<string>('');
    const { groupItems = [], selectedItem = null, activate = null, deactivate = null } = useInventoryFurni();
    const { resetItems = null } = useInventoryUnseenTracker();

    useEffect(() =>
    {
        if(!selectedItem)
        {
            setDescription('');
            return;
        }

        const furnitureItem = selectedItem.getLastItem();

        if(!furnitureItem)
        {
            setDescription('');
            return;
        }

        const sessionDataManager = GetSessionDataManager();
        let furniData = null;

        if(furnitureItem.isWallItem)
        {
            furniData = sessionDataManager.getWallItemData(furnitureItem.type);
        }
        else
        {
            furniData = sessionDataManager.getFloorItemData(furnitureItem.type);
        }

        setDescription(furniData ? furniData.description : '');

    }, [ selectedItem ]);

    useEffect(() =>
    {
        if(!selectedItem || !roomPreviewer) return;

        const furnitureItem = selectedItem.getLastItem();

        if(!furnitureItem) return;

        const roomEngine = GetRoomEngine();

        let wallType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_WALL_TYPE);
        let floorType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_FLOOR_TYPE);
        let landscapeType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_LANDSCAPE_TYPE);

        wallType = (wallType && wallType.length) ? wallType : '101';
        floorType = (floorType && floorType.length) ? floorType : '101';
        landscapeType = (landscapeType && landscapeType.length) ? landscapeType : '1.1';

        roomPreviewer.reset(false);
        roomPreviewer.updateObjectRoom(floorType, wallType, landscapeType);
        roomPreviewer.updateRoomWallsAndFloorVisibility(true, true);

        if((furnitureItem.category === FurniCategory.WALL_PAPER) || (furnitureItem.category === FurniCategory.FLOOR) || (furnitureItem.category === FurniCategory.LANDSCAPE))
        {
            floorType = ((furnitureItem.category === FurniCategory.FLOOR) ? selectedItem.stuffData.getLegacyString() : floorType);
            wallType = ((furnitureItem.category === FurniCategory.WALL_PAPER) ? selectedItem.stuffData.getLegacyString() : wallType);
            landscapeType = ((furnitureItem.category === FurniCategory.LANDSCAPE) ? selectedItem.stuffData.getLegacyString() : landscapeType);

            roomPreviewer.updateObjectRoom(floorType, wallType, landscapeType);

            if(furnitureItem.category === FurniCategory.LANDSCAPE)
            {
                const data = GetSessionDataManager().getWallItemDataByName('window_double_default');

                if(data) roomPreviewer.addWallItemIntoRoom(data.id, new Vector3d(90, 0, 0), data.customParams);
            }
        }
        else
        {
            if(selectedItem.isWallItem)
            {
                roomPreviewer.addWallItemIntoRoom(selectedItem.type, new Vector3d(90), furnitureItem.stuffData.getLegacyString());
            }
            else
            {
                roomPreviewer.addFurnitureIntoRoom(selectedItem.type, new Vector3d(90), selectedItem.stuffData, (furnitureItem.extra.toString()));
            }
        }
    }, [ roomPreviewer, selectedItem ]);

    useEffect(() =>
    {
        if(!selectedItem || !selectedItem.hasUnseenItems) return;

        resetItems(UnseenItemCategory.FURNI, selectedItem.items.map(item => item.id));

        selectedItem.hasUnseenItems = false;
    }, [ selectedItem, resetItems ]);

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

    if(!groupItems || !groupItems.length) return <InventoryCategoryEmptyView title={ LocalizeText('inventory.empty.title') } desc={ LocalizeText('inventory.empty.desc') } />;

    return (
        <Grid gap={ 1 }>
            <Column gap={ 1 } size={ 7 } overflow="hidden">
                <InventoryFurnitureSearchView groupItems={ groupItems } setGroupItems={ setFilteredGroupItems } />
                <LayoutGridItem center={ false } pointer={ false } fullHeight fullWidth grow overflow="hidden" className="p-1">
                    <Column fullHeight fullWidth position="relative" gap={ 1 } overflow="y-scroll" className="overflow-x-hidden" style={ { paddingRight: 0 } } >
                        <AutoGrid overflow="hidden" style={ { height: 42 } } columnMinHeight={ 41 } columnMinWidth={ 41 } fullHeight={ false } columnCount={ 6 } fullWidth className="layout-grid-row" gap={ 1 }>
                            { filteredGroupItems && (filteredGroupItems.length > 0) && filteredGroupItems.map((item, index) => <InventoryFurnitureItemView key={ index } groupItem={ item } />) }
                        </AutoGrid>
                    </Column>
                </LayoutGridItem>
            </Column>
            <Column size={ 5 } overflow="auto">
                <Column grow overflow="hidden" position="relative">
                    <LayoutRoomPreviewerView fullHeight roomPreviewer={ roomPreviewer } />
                    { selectedItem && selectedItem.stuffData.isUnique &&
                        <LayoutLimitedEditionCompactPlateView className="top-2 end-2" position="absolute" uniqueNumber={ selectedItem.stuffData.uniqueNumber } uniqueSeries={ selectedItem.stuffData.uniqueSeries } /> }
                    { (selectedItem && selectedItem.stuffData.rarityLevel > -1) &&
                        <LayoutRarityLevelView className="top-2 end-2" position="absolute" level={ selectedItem.stuffData.rarityLevel } /> }
                </Column>
                { selectedItem &&
                    <Column justifyContent="between" gap={ 1 } className="layout-grid-item p-1">
                        <Text wrap fontWeight="bold" small display="inline">{ selectedItem.name }</Text>
                        <Text wrap small display="inline">{ description }</Text>
                        <Column gap={ 1 }>
                            { !!roomSession &&
                                <Button variant="success" onClick={ event => attemptItemPlacement(selectedItem) }>
                                    { LocalizeText('inventory.furni.placetoroom') }
                                </Button> }
                            { (selectedItem && selectedItem.isSellable) &&
                                <Button onClick={ event => attemptPlaceMarketplaceOffer(selectedItem) }>
                                    { LocalizeText('inventory.marketplace.sell') }
                                </Button> }
                        </Column>
                    </Column> }
            </Column>
        </Grid>
    );
}
