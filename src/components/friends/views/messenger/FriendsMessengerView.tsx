import { FollowFriendMessageComposer, ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { AddEventLinkTracker, GetSessionDataManager, GetUserProfile, LocalizeText, RemoveLinkEventTracker, ReportType, SendMessageComposer } from '../../../../api';
import { Base, Button, ButtonGroup, Column, Flex, LayoutAvatarImageView, LayoutBadgeImageView, LayoutGridItem, LayoutItemCountView, NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../../../common';
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

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) =>
    {
        if(event.key !== 'Enter') return;

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
            if(lastThreadId > 0)
            {
                setActiveThreadId(lastThreadId);
            }
            else
            {
                if(visibleThreads.length > 0) setActiveThreadId(visibleThreads[0].threadId);
            }

            return;
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
            <NitroCardContentView>
                <Column fullHeight gap={0} overflow="hidden">
                    <Column className='h-25' fullWidth overflow="hidden">
                        <Column fullHeight fit overflow="hidden">
                            <Flex fullHeight gap={1}>
                                { visibleThreads && (visibleThreads.length > 0) && visibleThreads.map(thread =>
                                {
                                    return (
                                        <LayoutGridItem className="friend-head-container" key={ thread.threadId } itemActive={ (activeThread === thread) } onClick={ event => setActiveThreadId(thread.threadId) }>
                                            { thread.unread &&
                                            <LayoutItemCountView count={ thread.unreadCount } /> }
                                            <Flex alignItems="center" gap={ 1 }>
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
                        </Column>
                    </Column>
                    <Column fullHeight fullWidth overflow="hidden">
                        { activeThread &&
                            <Column fullHeight>
                                <Flex alignItems="center" justifyContent="between" gap={ 1 }>
                                    <Flex gap={ 1 }>
                                        <ButtonGroup>
                                            <Button onClick={ followFriend }>
                                                <Base className="nitro-friends-spritesheet icon-follow" />
                                            </Button>
                                            <Button onClick={ openProfile }>
                                                <Base className="nitro-friends-spritesheet icon-profile-sm" />
                                            </Button>
                                        </ButtonGroup>
                                        <Button variant="danger" onClick={ () => report(ReportType.IM, { reportedUserId: activeThread.participant.id }) }>
                                            { LocalizeText('messenger.window.button.report') }
                                        </Button>
                                    </Flex>
                                    <Button onClick={ event => closeThread(activeThread.threadId) }>
                                        <FaTimes className="fa-icon" />
                                    </Button>
                                </Flex>
                                <Column fullHeight>
                                    <Column fit className="bg-muted p-2 rounded chat-messages">
                                        <Column innerRef={ messagesBox } overflow="auto">
                                            <FriendsMessengerThreadView thread={ activeThread } />
                                        </Column>
                                    </Column>
                                    <Flex gap={ 1 }>
                                        <input type="text" className="form-control form-control-sm" maxLength={ 255 } placeholder={ LocalizeText('messenger.window.input.default', [ 'FRIEND_NAME' ], [ activeThread.participant.name ]) } value={ messageText } onChange={ event => setMessageText(event.target.value) } onKeyDown={ onKeyDown } />
                                        <Button variant="success" onClick={ send }>
                                            { LocalizeText('widgets.chatinput.say') }
                                        </Button>
                                    </Flex>
                                </Column>
                            </Column> }
                    </Column>
                </Column>
            </NitroCardContentView>
            <div className="bottom-header"></div>
        </NitroCardView>
    );
}
