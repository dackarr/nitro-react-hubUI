import { Dispose, DropBounce, EaseOut, JumpBy, Motions, NitroToolbarAnimateIconEvent, PerkAllowancesMessageEvent, PerkEnum, Queue, Wait } from '@nitrots/nitro-renderer';
import { FC, useState } from 'react';
import { CreateLinkEvent, GetConfiguration, GetSessionDataManager, MessengerIconState, OpenMessengerChat, VisitDesktop } from '../../api';
import { Base, Flex, LayoutAvatarImageView, LayoutItemCountView, TransitionAnimation, TransitionAnimationTypes } from '../../common';
import { useAchievements, useFriends, useInventoryUnseenTracker, useMessageEvent, useMessenger, useRoomEngineEvent, useSessionInfo } from '../../hooks';
import { ToolbarMeView } from './ToolbarMeView';

export const ToolbarView: FC<{ isInRoom: boolean }> = props =>
{
    const { isInRoom } = props;
    const [ isMeExpanded, setMeExpanded ] = useState(false);
    const [ useGuideTool, setUseGuideTool ] = useState(false);
    // --- AÑADIDO: Estado para controlar si la barra está plegada ---
    const [ isCollapsed, setCollapsed ] = useState(false);
    const { userFigure = null } = useSessionInfo();
    const { getFullCount = 0 } = useInventoryUnseenTracker();
    const { getTotalUnseen = 0 } = useAchievements();
    const { requests = [] } = useFriends();
    const { iconState = MessengerIconState.HIDDEN } = useMessenger();
    const isMod = GetSessionDataManager().isModerator;

    useMessageEvent<PerkAllowancesMessageEvent>(PerkAllowancesMessageEvent, event =>
    {
        const parser = event.getParser();

        setUseGuideTool(parser.isAllowed(PerkEnum.USE_GUIDE_TOOL));
    });

    useRoomEngineEvent<NitroToolbarAnimateIconEvent>(NitroToolbarAnimateIconEvent.ANIMATE_ICON, event =>
    {
        const animationIconToToolbar = (iconName: string, image: HTMLImageElement, x: number, y: number) =>
        {
            const target = (document.body.getElementsByClassName(iconName)[0] as HTMLElement);

            if(!target) return;

            image.className = 'toolbar-icon-animation';
            image.style.visibility = 'visible';
            image.style.left = (x + 'px');
            image.style.top = (y + 'px');

            document.body.append(image);

            const targetBounds = target.getBoundingClientRect();
            const imageBounds = image.getBoundingClientRect();

            const left = (imageBounds.x - targetBounds.x);
            const top = (imageBounds.y - targetBounds.y);
            const squared = Math.sqrt(((left * left) + (top * top)));
            const wait = (500 - Math.abs(((((1 / squared) * 100) * 500) * 0.5)));
            const height = 20;

            const motionName = (`ToolbarBouncing[${ iconName }]`);

            if(!Motions.getMotionByTag(motionName))
            {
                Motions.runMotion(new Queue(new Wait((wait + 8)), new DropBounce(target, 400, 12))).tag = motionName;
            }

            const motion = new Queue(new EaseOut(new JumpBy(image, wait, ((targetBounds.x - imageBounds.x) + height), (targetBounds.y - imageBounds.y), 100, 1), 1), new Dispose(image));

            Motions.runMotion(motion);
        }

        animationIconToToolbar('icon-inventory', event.image, event.x, event.y);
    });

    return (
        <>
            { isMod &&
                <Base pointer position='absolute' className="m-2 icon icon-modtools" onClick={ event => CreateLinkEvent('mod-tools/toggle') } /> }
            <TransitionAnimation type={ TransitionAnimationTypes.FADE_IN } inProp={ isMeExpanded } timeout={ 300 }>
                <ToolbarMeView useGuideTool={ useGuideTool } unseenAchievementCount={ getTotalUnseen } setMeExpanded={ setMeExpanded } />
            </TransitionAnimation>
            <Flex alignItems="center" justifyContent="between" className={ `nitro-toolbar ${ isCollapsed ? 'collapsed' : '' }` }>
                <Flex pointer fullHeight alignItems="center" justifyContent="center" className="bg-hubGrey1D p-1" onClick={ () => setCollapsed(prev => !prev) }>
                    <Base className={ `icon ${ isCollapsed ? 'icon-arrow-reverse' : 'icon-arrow' }` }/>
                </Flex>
                <Flex fullHeight gap={ 3 } alignItems="center" justifyContent="between" className="toolbar-navigation-list pe-3 ps-3">
                    { isInRoom &&
                        <Base pointer className="navigation-item icon icon-habbo" onClick={ event => VisitDesktop() } /> }
                    { !isInRoom &&
                        <Base pointer className="navigation-item icon icon-house" onClick={ event => CreateLinkEvent('navigator/goto/home') } /> }
                    <Base className="vert-splitter vert-splitter-light" />
                    <Base pointer className="navigation-item icon icon-rooms" onClick={ event => CreateLinkEvent('navigator/toggle') } />
                    { GetConfiguration('game.center.enabled') && <Base pointer className="navigation-item icon icon-game" onClick={ event => CreateLinkEvent('games/toggle') } /> }
                    <Base pointer className="navigation-item icon icon-catalog" onClick={ event => CreateLinkEvent('catalog/toggle') } />
                    <Base pointer className="navigation-item icon icon-inventory" onClick={ event => CreateLinkEvent('inventory/toggle') }>
                        { (getFullCount > 0) &&
                            <LayoutItemCountView count={ getFullCount } /> }
                    </Base>
                    <Flex center pointer className={ 'navigation-item item-avatar ' + (isMeExpanded ? 'active ' : '') } onClick={ event => setMeExpanded(!isMeExpanded) }>
                        <LayoutAvatarImageView headOnly={ true } figure={ userFigure } direction={ 3 } position="absolute" />
                        { (getTotalUnseen > 0) &&
                            <LayoutItemCountView count={ getTotalUnseen } /> }
                    </Flex>
                    { isInRoom &&
                        <Base pointer className="navigation-item icon icon-camera" onClick={ event => CreateLinkEvent('camera/toggle') } /> }
                    { ((iconState === MessengerIconState.SHOW) || (iconState === MessengerIconState.UNREAD)) &&
                        <Base pointer className={ `navigation-item icon icon-message ${ (iconState === MessengerIconState.UNREAD) && 'is-unseen' }` } onClick={ event => OpenMessengerChat() } /> }
                </Flex>
            </Flex>
            <Flex gap={ 2 } alignItems="center">
                <Flex alignItems="center" id="toolbar-chat-input-container" />
            </Flex>
            <Flex justifyContent="center" alignItems="center" >
                <Base id="toolbar-friend-bar-container" className="d-none d-lg-block" />
                { /* <Base pointer className="navigation-item icon icon-friendall" onClick={ event => CreateLinkEvent('friends/toggle') }>
                        { (requests.length > 0) &&
                            <LayoutItemCountView count={ requests.length } /> }
                    </Base>
                    { ((iconState === MessengerIconState.SHOW) || (iconState === MessengerIconState.UNREAD)) &&
                        <Base pointer className={ `navigation-item icon icon-message ${ (iconState === MessengerIconState.UNREAD) && 'is-unseen' }` } onClick={ event => OpenMessengerChat() } /> } */ }
            </Flex>
        </>
    );
}
