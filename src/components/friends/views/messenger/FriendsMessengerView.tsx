import { FollowFriendMessageComposer, ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AddEventLinkTracker, GetSessionDataManager, GetUserProfile, LocalizeText, RemoveLinkEventTracker, ReportType, SendMessageComposer } from '../../../../api';
import { Base, ButtonGroup, Column, Flex, LayoutAvatarImageView, LayoutBadgeImageView, LayoutGridItem, LayoutItemCountView, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text, UserProfileIconView } from '../../../../common';
import { useHelp, useMessenger } from '../../../../hooks';
import { FriendsMessengerThreadView } from './messenger-thread/FriendsMessengerThreadView';

export const FriendsMessengerView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ lastThreadId, setLastThreadId ] = useState(-1);
    const [ messageText, setMessageText ] = useState('');
    const { visibleThreads = [], activeThread = null, getMessageThread = null, sendMessage = null, setActiveThreadId = null, closeThread = null } = useMessenger();
    const { report = null } = useHelp();
    const messagesBox = useRef<HTMLDivElement>();

    const followFriend = () => (activeThread && activeThread.participant && SendMessageComposer(new FollowFriendMessageComposer(activeThread.participant.id)));
    const openProfile = () => (activeThread && activeThread.participant && GetUserProfile(activeThread.participant.id));

    const send = () =>
    {
        if(!activeThread || !messageText.length) return;

        sendMessage(activeThread, GetSessionDataManager().userId, messageText);

        setMessageText('');
    }

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) =>
    {
        if(event.key !== 'Enter') return;

        if(event.shiftKey) return;

        event.preventDefault();
        send();
    }

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length === 2)
                {
                    if(parts[1] === 'open')
                    {
                        setIsVisible(true);

                        return;
                    }

                    if(parts[1] === 'toggle')
                    {
                        setIsVisible(prevValue => !prevValue);

                        return;
                    }

                    const thread = getMessageThread(parseInt(parts[1]));

                    if(!thread) return;

                    setActiveThreadId(thread.threadId);
                    setIsVisible(true);
                }
            },
            eventUrlPrefix: 'friends-messenger/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ getMessageThread, setActiveThreadId ]);

    useEffect(() =>
    {
        if(!isVisible || !activeThread) return;

        messagesBox.current.scrollTop = messagesBox.current.scrollHeight;
    }, [ isVisible, activeThread ]);

    useEffect(() =>
    {
        if(isVisible && !activeThread)
        {
            const timeout = setTimeout(() =>
            {
                if((lastThreadId > 0) && visibleThreads.find(thread => (thread.threadId === lastThreadId)))
                {
                    setActiveThreadId(lastThreadId);
                }
                else
                {
                    if(visibleThreads.length > 0)
                    {
                        setActiveThreadId(visibleThreads[0].threadId);
                    }
                    else
                    {
                        setIsVisible(false);
                    }
                }
            });

            return () => clearTimeout(timeout);
        }

        if(!isVisible && activeThread)
        {
            setLastThreadId(activeThread.threadId);
            setActiveThreadId(-1);
        }
    }, [ isVisible, activeThread, lastThreadId, visibleThreads, setActiveThreadId ]);

    if(!isVisible) return null;

    return (
        <NitroCardView className="nitro-friends-messenger" uniqueKey="nitro-friends-messenger" theme="yellow">
            <NitroCardHeaderView headerText={ LocalizeText('messenger.window.title', [ 'OPEN_CHAT_COUNT' ], [ visibleThreads.length.toString() ]) } onCloseClick={ event => setIsVisible(false) } />
            <NitroCardContentView className='p-0'>
                <Column fullHeight gap={0} overflow="hidden">
                    <Flex className="p-1" gap={1}>
                        { visibleThreads && (visibleThreads.length > 0) && visibleThreads.map(thread =>
                        {
                            return (
                                <LayoutGridItem className="friend-head-container" key={ thread.threadId } itemActive={ (activeThread === thread) } onClick={ event => setActiveThreadId(thread.threadId) }>
                                    { thread.unread &&
                                    <LayoutItemCountView count={ thread.unreadCount } /> }
                                    <Flex justifyContent='center' alignItems="center" gap={ 1 }>
                                        <Flex alignItems="center" className="friend-head px-1">
                                            { (thread.participant.id > 0) &&
                                            <LayoutAvatarImageView figure={ thread.participant.figure } headOnly={ true } direction={ 3 } /> }
                                            { (thread.participant.id <= 0) &&
                                            <LayoutBadgeImageView isGroup={ true } badgeCode={ thread.participant.figure } /> }
                                        </Flex>
                                    </Flex>
                                </LayoutGridItem>
                            );
                        }) }
                    </Flex>
                    <Column fullHeight fullWidth overflow="hidden">
                        { activeThread &&
                            <Column gap={0} fullHeight>
                                <Flex className="p-1 px-2 participant-info" alignItems="center" justifyContent="between" gap={ 1 }>
                                    <Flex alignItems='center' gap={ 2 }>
                                        <ButtonGroup>
                                            <Flex gap={1} alignItems='center'>
                                                <UserProfileIconView userId={ activeThread.participant.id } userName={ activeThread.participant.name } />
                                                <Text bold variant='black'>{ activeThread.participant.name }</Text>
                                            </Flex>
                                        </ButtonGroup>
                                        <Base onClick={ () => report(ReportType.IM, { reportedUserId: activeThread.participant.id }) } className="nitro-friends-spritesheet icon-report cursor-pointer" /> 
                                    </Flex>
                                    <Flex alignItems='center' gap={2}>
                                        <Base onClick={ followFriend } className="nitro-friends-spritesheet icon-follow cursor-pointer" />
                                        <Base onClick={ event => {
                                            event.stopPropagation();
                                            closeThread(activeThread.threadId);
                                        } } className="nitro-friends-spritesheet icon-messenger-close cursor-pointer" />
                                    </Flex>
                                </Flex>
                                <Column fullHeight>
                                    <Column fit className="rounded bg-white chat-messages">
                                        <Column gap={0} innerRef={ messagesBox } overflow="auto">
                                            <FriendsMessengerThreadView thread={ activeThread } />
                                        </Column>
                                    </Column>
                                </Column>
                            </Column> }
                    </Column>
                </Column>
            </NitroCardContentView>
            <Flex className="bottom-header">
                <Flex fullWidth className='messenger-input' gap={ 1 }>
                    <textarea className="form-control form-control-sm" maxLength={ 255 } placeholder={ LocalizeText('messenger.window.input.default', [ 'FRIEND_NAME' ], [ (activeThread ? activeThread.participant.name : '') ]) } value={ messageText } onChange={ event => setMessageText(event.target.value) } onKeyDown={ onKeyDown } />
                </Flex>
            </Flex>
        </NitroCardView>
    );
}
