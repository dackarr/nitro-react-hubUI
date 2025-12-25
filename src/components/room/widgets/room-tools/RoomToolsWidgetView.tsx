import { GetGuestRoomResultEvent, NavigatorSearchComposer, RateFlatMessageComposer } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { CreateLinkEvent, GetRoomEngine, LocalizeText, SendMessageComposer } from '../../../../api';
import { Base, Column, Flex, Text } from '../../../../common';
import { useMessageEvent, useNavigator, useRoom } from '../../../../hooks';

export const RoomToolsWidgetView: FC<{}> = props =>
{
    const [ isZoomedIn, setIsZoomedIn ] = useState<boolean>(false);
    const [ roomName, setRoomName ] = useState<string>(null);
    const [ roomOwner, setRoomOwner ] = useState<string>(null);
    const [ roomTags, setRoomTags ] = useState<string[]>(null);
    const [ isOpen, setIsOpen ] = useState<boolean>(false);
    const [ isCollapsed, setCollapsed ] = useState<boolean>(false);
    const { navigatorData = null } = useNavigator();
    const { roomSession = null } = useRoom();

    const handleToolClick = (action: string, value?: string) =>
    {
        switch(action)
        {
            case 'settings':
                CreateLinkEvent('navigator/toggle-room-info');
                return;
            case 'zoom-in':
                setIsZoomedIn(prevValue =>
                {
                    const currentScale = GetRoomEngine().getRoomInstanceRenderingCanvasScale(roomSession.roomId, 1);

                    const newScale = Math.max(0.5, currentScale / 2);

                    GetRoomEngine().setRoomInstanceRenderingCanvasScale(roomSession.roomId, 1, newScale);

                    return newScale < 1;
                });
                return;
            case 'zoom-out':
                setIsZoomedIn(prevValue =>
                {
                    let scale = GetRoomEngine().getRoomInstanceRenderingCanvasScale(roomSession.roomId, 1);
                    scale *= 2;
                    GetRoomEngine().setRoomInstanceRenderingCanvasScale(roomSession.roomId, 1, scale);
                    return false;
                });
                return;
            case 'chat_history':
                CreateLinkEvent('chat-history/toggle');
                return;
            case 'like_room':
                SendMessageComposer(new RateFlatMessageComposer(1));
                return;
            case 'toggle_room_link':
                CreateLinkEvent('navigator/toggle-room-link');
                return;
            case 'navigator_search_tag':
                CreateLinkEvent(`navigator/search/${ value }`);
                SendMessageComposer(new NavigatorSearchComposer('hotel_view', `tag:${ value }`));
                return;
        }
    }

    useMessageEvent<GetGuestRoomResultEvent>(GetGuestRoomResultEvent, event =>
    {
        const parser = event.getParser();

        if(!parser.roomEnter || (parser.data.roomId !== roomSession.roomId)) return;

        if(roomName !== parser.data.roomName) setRoomName(parser.data.roomName);
        if(roomOwner !== parser.data.ownerName) setRoomOwner(parser.data.ownerName);
        if(roomTags !== parser.data.tags) setRoomTags(parser.data.tags);
    });

    useEffect(() =>
    {
        setCollapsed(false);

        const timeout = setTimeout(() => setCollapsed(true), 3000);

        return () => clearTimeout(timeout);
    }, [ roomSession?.roomId ]);

    return (
        <Flex className="nitro-room-tools-container" gap={ 2 }>
            <Flex center className={ `nitro-room-tools ${ isCollapsed ? 'hidden' : '' }` }>
                <Flex pointer fullHeight alignItems="center" justifyContent="center" className="bg-hubGrey1D nitro-room-tools-toggle p-1" onClick={ () => setCollapsed(prev => !prev) }>
                    <Base className={ `icon ${ isCollapsed ? 'icon-arrow-reverse' : 'icon-arrow' }` }/>
                </Flex>
                <Flex className="tools-content">
                    <Column gap={ 0 } className="px-2 py-1">
                        <Text className="rt-room-name" wrap variant="white">{ roomName }</Text>
                        <Flex gap={ 1 } justifyContent="between" className="flex-1">
                            <Text className="mb-1" shrink={ false } variant="muted">{ roomOwner }</Text>
                            <Flex gap={ 1 } alignSelf="end">
                                <Flex className="rt-btn-grp">
                                    <Base pointer title={ LocalizeText('room.zoom.button.text') }
                                        onClick={ () => handleToolClick(isZoomedIn ? '' : 'zoom-in') }
                                        className="icon icon-zoom-less"/>
                                </Flex>
                                <Flex className="rt-btn-grp">
                                    <Base pointer title={ LocalizeText('room.zoom.button.text') }
                                        onClick={ () => handleToolClick('zoom-out') }
                                        className="icon icon-zoom-more"/>
                                </Flex>
                                <Flex className="rt-btn-grp">
                                    <Base pointer title={ LocalizeText('room.chathistory.button.text') }
                                        onClick={ () => handleToolClick('chat_history') } className="icon icon-chat-history"/>
                                </Flex>
                                { navigatorData.canRate &&
                                <Flex className="rt-btn-grp">
                                    <Base pointer title={ LocalizeText('room.like.button.text') }
                                        onClick={ () => handleToolClick('like_room') } className="icon icon-like-room"/>
                                </Flex>
                                }
                            </Flex>
                        </Flex>
                    </Column>
                </Flex>
                <Flex pointer fullHeight alignItems="center" justifyContent="center" className="bg-hubGrey1D nitro-room-tools-toggle p-1">
                    <Base pointer title={ LocalizeText('room.settings.button.text') } className="icon icon-cog"
                        onClick={ () => handleToolClick('settings') }/>
                </Flex>
            </Flex>
        </Flex>
    );
}
