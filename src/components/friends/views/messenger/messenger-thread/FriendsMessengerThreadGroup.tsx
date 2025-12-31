import { FC, useMemo } from 'react';
import { GetGroupChatData, GetSessionDataManager, LocalizeText, MessengerGroupType, MessengerThread, MessengerThreadChat, MessengerThreadChatGroup } from '../../../../../api';
import { Base, Flex } from '../../../../../common';

export const FriendsMessengerThreadGroup: FC<{ thread: MessengerThread, group: MessengerThreadChatGroup }> = props =>
{
    const { thread = null, group = null } = props;

    const groupChatData = useMemo(() => ((group.type === MessengerGroupType.GROUP_CHAT) && GetGroupChatData(group.chats[0].extraData)), [ group ]);

    const isOwnChat = useMemo(() =>
    {
        if(!thread || !group) return false;
        
        if((group.type === MessengerGroupType.PRIVATE_CHAT) && (group.userId === GetSessionDataManager().userId)) return true;

        if(groupChatData && group.chats.length && (groupChatData.userId === GetSessionDataManager().userId)) return true;

        return false;
    }, [ thread, group, groupChatData ]);

    if(!thread || !group) return null;
    
    if(!group.userId)
    {
        return (
            <>
                { group.chats.map((chat, index) =>
                {
                    return (
                        <Flex key={ index } fullWidth gap={ 2 } justifyContent="start">
                            <Base className="w-100 text-break">
                                { (chat.type === MessengerThreadChat.SECURITY_NOTIFICATION) &&
                                    <Flex gap={ 2 } alignItems="center" className="alert-info px-2 py-1 small text-muted">
                                        <Base className="nitro-friends-spritesheet icon-warning flex-shrink-0" />
                                        <Base className='alert-text'>{ chat.message }</Base>
                                    </Flex> }
                                { (chat.type === MessengerThreadChat.ROOM_INVITE) &&
                                    <Flex gap={ 2 } alignItems="center" className="alert-info room-invite message-text p-1 small text-black">
                                        <Base className="messenger-notification-icon flex-shrink-0" />
                                        <Base className='alert-text'>{ (LocalizeText('messenger.invitation') + ' ') }{ chat.message }</Base>
                                    </Flex> }
                            </Base>
                        </Flex>
                    );
                }) }
            </>
        );
    }
    
    return (
        <Flex fullWidth justifyContent={ isOwnChat ? 'end' : 'start' } gap={ 2 }>
            <Base fullWidth className={ 'text-black ' + (!isOwnChat && 'not-own-chat') }>
                { group.chats.map((chat, index) =>
                {

                    const date = new Date(chat.date.getTime() - (chat.secondsSinceSent * 1000));
                    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isGroupChat = (group.type === MessengerGroupType.GROUP_CHAT) || (thread.participant.id <= 0);
                    const username = isGroupChat ? (isOwnChat ? GetSessionDataManager().userName : (groupChatData ? groupChatData.username : thread.participant.name)) : null;

                    return (
                        <Base key={ index } className={ `text-break message-text` }>
                            <span>{ time }</span>
                            { isGroupChat && <span className=" ms-1">{ username }:</span> }
                            { !isGroupChat && <span className="fw-bold">:</span> }
                            <span className="ms-1">{ chat.message }</span>
                        </Base>
                    );
                }) }
            </Base>
        </Flex>
    );
}
