import { IRoomSession, RoomObjectVariable, RoomPreviewer } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { attemptPetPlacement, GetRoomEngine, LocalizeText, UnseenItemCategory } from '../../../../api';
import { AutoGrid, Button, Column, Grid, LayoutGridItem, LayoutRoomPreviewerView, Text } from '../../../../common';
import { useInventoryPets, useInventoryUnseenTracker } from '../../../../hooks';
import { InventoryCategoryEmptyView } from '../InventoryCategoryEmptyView';
import { InventoryPetItemView } from './InventoryPetItemView';

interface InventoryPetViewProps
{
    roomSession: IRoomSession;
    roomPreviewer: RoomPreviewer;
}

export const InventoryPetView: FC<InventoryPetViewProps> = props =>
{
    const { roomSession = null, roomPreviewer = null } = props;
    const [ isVisible, setIsVisible ] = useState(false);
    const { petItems = null, selectedPet = null, activate = null, deactivate = null } = useInventoryPets();
    const { isUnseen = null, removeUnseen = null } = useInventoryUnseenTracker();

    useEffect(() =>
    {
        if(!selectedPet || !roomPreviewer) return;

        const petData = selectedPet.petData;
        const roomEngine = GetRoomEngine();

        let wallType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_WALL_TYPE);
        let floorType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_FLOOR_TYPE);
        let landscapeType = roomEngine.getRoomInstanceVariable<string>(roomEngine.activeRoomId, RoomObjectVariable.ROOM_LANDSCAPE_TYPE);

        wallType = (wallType && wallType.length) ? wallType : '101';
        floorType = (floorType && floorType.length) ? floorType : '101';
        landscapeType = (landscapeType && landscapeType.length) ? landscapeType : '1.1';

        roomPreviewer.reset(false);
        roomPreviewer.updateRoomWallsAndFloorVisibility(true, true);
        roomPreviewer.updateObjectRoom(floorType, wallType, landscapeType);
        roomPreviewer.addPetIntoRoom(petData.figureString);
    }, [ roomPreviewer, selectedPet ]);

    useEffect(() =>
    {
        if(!selectedPet || !isUnseen(UnseenItemCategory.PET, selectedPet.petData.id)) return;

        removeUnseen(UnseenItemCategory.PET, selectedPet.petData.id);
    }, [ selectedPet, isUnseen, removeUnseen ]);

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

    if(!petItems || !petItems.length) return <InventoryCategoryEmptyView title={ LocalizeText('inventory.empty.pets.title') } desc={ LocalizeText('inventory.empty.pets.desc') } />;

    return (
        <Grid overflow='hidden' gap={ 1 }>
            <Column size={ 7 } overflow="hidden">
                <LayoutGridItem center={ false } pointer={ false } fullHeight fullWidth grow overflow="hidden" className="p-1">
                    <Column fullHeight fullWidth position="relative" gap={ 1 } className="overflow-x-hidden" style={ { paddingRight: 0 } } >
                        <AutoGrid gap={ 1 } columnMinHeight={ 50 } columnMinWidth={ 50 } fullHeight={ false } className="layout-grid-row position-relative justify-content-center" columnCount={ 5 }>
                            { petItems && (petItems.length > 0) && petItems.map(item => <InventoryPetItemView key={ item.petData.id } petItem={ item } />) }
                        </AutoGrid>
                    </Column>
                </LayoutGridItem>
            </Column>
            <Column size={ 5 } overflow="auto">
                <Column fullHeight overflow="hidden" position="relative">
                    <LayoutRoomPreviewerView roomPreviewer={ roomPreviewer } fullHeight />
                </Column>
                { selectedPet && selectedPet.petData &&
                    <Column grow justifyContent="between" gap={ 1 } className="layout-grid-item p-1">
                        <Text wrap fontWeight="bold" small display="inline">{ selectedPet.petData.name }</Text>
                        { !!roomSession &&
                            <Button variant="success" onClick={ event => attemptPetPlacement(selectedPet) }>
                                { LocalizeText('inventory.furni.placetoroom') }
                            </Button> }
                    </Column> }
            </Column>
        </Grid>
    );
}
