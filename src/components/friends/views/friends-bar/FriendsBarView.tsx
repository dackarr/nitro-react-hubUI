import { FC, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CreateLinkEvent, MessengerFriend } from '../../../../api';
import { Base, Button, Flex, LayoutItemCountView } from '../../../../common';
import { useFriends } from '../../../../hooks';
import { FriendBarItemView } from './FriendBarItemView';

const MAX_DISPLAY_COUNT = 2;

export const FriendBarView: FC<{ onlineFriends: MessengerFriend[] }> = props =>
{
    const { onlineFriends = [] } = props;
    const [ indexOffset, setIndexOffset ] = useState(0);
    const [ isCollapsed, setCollapsed ] = useState(false);
    const elementRef = useRef<HTMLDivElement>();
    const { requests = [] } = useFriends();

    return (
        <Flex innerRef={ elementRef } alignItems="center" className={ `friend-bar ${ isCollapsed ? 'collapsed' : '' }` }>
            <Base pointer className="navigation-item icon icon-friendall p-4 ms-2" onClick={ event => CreateLinkEvent('friends/toggle') }>
                { (requests.length > 0) &&
                    <LayoutItemCountView count={ requests.length } /> }
            </Base>
            <Flex gap={ 1 } justifyContent="center" alignItems="center" fullHeight fullWidth className="friend-bar-inner p-2">
                { onlineFriends[ indexOffset ] &&
                <Button disabled={ indexOffset === 0 } fullHeight variant="transparent" className="btn-hubGrey3 friend-bar-button" onClick={ event => setIndexOffset(indexOffset - 1) }>
                    <FaChevronLeft className="fa-icon" />
                </Button>
                }
                {
                    Array.from(Array((onlineFriends.length < MAX_DISPLAY_COUNT) ? 1 : MAX_DISPLAY_COUNT), (e, i) => <FriendBarItemView key={ i } friend={ (onlineFriends[ indexOffset + i ] || null) } />)
                }
                { onlineFriends[indexOffset] &&
                <Button disabled={ !((onlineFriends.length > MAX_DISPLAY_COUNT) && ((indexOffset + MAX_DISPLAY_COUNT) <= (onlineFriends.length - 1))) } fullHeight variant="transparent" className="btn-hubGrey3 friend-bar-button" onClick={ event => setIndexOffset(indexOffset + 1) }>
                    <FaChevronRight className="fa-icon" />
                </Button>
                }
            </Flex>
            <Flex pointer fullHeight alignItems="center" justifyContent="center" onClick={ () => setCollapsed(prev => !prev) } className="bg-hubGrey1D p-1 flex-shrink-0">
                <Base onClick={ !isCollapsed ? () => setCollapsed(false) : () => setCollapsed(true) } className={ `icon ${ isCollapsed ? 'icon-arrow' : 'icon-arrow-reverse' }` }/>
            </Flex>
        </Flex>
    );
}
