import { RelationshipStatusInfoEvent, RelationshipStatusInfoMessageParser, RoomSessionFavoriteGroupUpdateEvent, RoomSessionUserBadgesEvent, RoomSessionUserFigureUpdateEvent, UserRelationshipsComposer } from '@nitrots/nitro-renderer';
import { Dispatch, FC, FocusEvent, KeyboardEvent, SetStateAction, useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { AvatarInfoUser, CloneObject, GetConfiguration, GetGroupInformation, GetSessionDataManager, GetUserProfile, LocalizeText, SendMessageComposer } from '../../../../../api';
import { Base, Column, Flex, LayoutAvatarImageView, LayoutBadgeImageView, Text } from '../../../../../common';
import { useMessageEvent, useRoom, useRoomSessionManagerEvent } from '../../../../../hooks';
import { InfoStandWidgetUserRelationshipsView } from './InfoStandWidgetUserRelationshipsView';
import { InfoStandWidgetUserTagsView } from './InfoStandWidgetUserTagsView';

interface InfoStandWidgetUserViewProps
{
    avatarInfo: AvatarInfoUser;
    setAvatarInfo: Dispatch<SetStateAction<AvatarInfoUser>>;
    onClose: () => void;
}

export const InfoStandWidgetUserView: FC<InfoStandWidgetUserViewProps> = props =>
{
    const { avatarInfo = null, setAvatarInfo = null, onClose = null } = props;
    const [ motto, setMotto ] = useState<string>(null);
    const [ isEditingMotto, setIsEditingMotto ] = useState(false);
    const [ relationships, setRelationships ] = useState<RelationshipStatusInfoMessageParser>(null);
    const { roomSession = null } = useRoom();

    const saveMotto = (motto: string) =>
    {
        if(!isEditingMotto || (motto.length > GetConfiguration<number>('motto.max.length', 38))) return;

        roomSession.sendMottoMessage(motto);

        setIsEditingMotto(false);
    }

    const onMottoBlur = (event: FocusEvent<HTMLInputElement>) => saveMotto(event.target.value);

    const onMottoKeyDown = (event: KeyboardEvent<HTMLInputElement>) =>
    {
        event.stopPropagation();

        switch(event.key)
        {
            case 'Enter':
                saveMotto((event.target as HTMLInputElement).value);
                return;
        }
    }

    useRoomSessionManagerEvent<RoomSessionUserBadgesEvent>(RoomSessionUserBadgesEvent.RSUBE_BADGES, event =>
    {
        if(!avatarInfo || (avatarInfo.webID !== event.userId)) return;

        const oldBadges = avatarInfo.badges.join('');

        if(oldBadges === event.badges.join('')) return;

        setAvatarInfo(prevValue =>
        {
            const newValue = CloneObject(prevValue);

            newValue.badges = event.badges;

            return newValue;
        });
    });

    useRoomSessionManagerEvent<RoomSessionUserFigureUpdateEvent>(RoomSessionUserFigureUpdateEvent.USER_FIGURE, event =>
    {
        if(!avatarInfo || (avatarInfo.roomIndex !== event.roomIndex)) return;

        setAvatarInfo(prevValue =>
        {
            const newValue = CloneObject(prevValue);

            newValue.figure = event.figure;
            newValue.motto = event.customInfo;
            newValue.achievementScore = event.activityPoints;

            return newValue;
        });
    });

    useRoomSessionManagerEvent<RoomSessionFavoriteGroupUpdateEvent>(RoomSessionFavoriteGroupUpdateEvent.FAVOURITE_GROUP_UPDATE, event =>
    {
        if(!avatarInfo || (avatarInfo.roomIndex !== event.roomIndex)) return;

        setAvatarInfo(prevValue =>
        {
            const newValue = CloneObject(prevValue);
            const clearGroup = ((event.status === -1) || (event.habboGroupId <= 0));

            newValue.groupId = clearGroup ? -1 : event.habboGroupId;
            newValue.groupName = clearGroup ? null : event.habboGroupName
            newValue.groupBadgeId = clearGroup ? null : GetSessionDataManager().getGroupBadge(event.habboGroupId);

            return newValue;
        });
    });

    useMessageEvent<RelationshipStatusInfoEvent>(RelationshipStatusInfoEvent, event =>
    {
        const parser = event.getParser();

        if(!avatarInfo || (avatarInfo.webID !== parser.userId)) return;

        setRelationships(parser);
    });

    useEffect(() =>
    {
        setIsEditingMotto(false);
        setMotto(avatarInfo.motto);

        SendMessageComposer(new UserRelationshipsComposer(avatarInfo.webID));

        return () =>
        {
            setIsEditingMotto(false);
            setMotto(null);
            setRelationships(null);
        }
    }, [ avatarInfo ]);

    if(!avatarInfo) return null;

    return (
            <Column gap={0} className='nitro-card rounded-1 theme-primary-dark'>
                <Column center position="relative" className='container-fluid nitro-card-header'>
                    <Flex gap={1} fullWidth>
                        <Flex onClick={event => GetUserProfile(avatarInfo.webID)} alignItems='center' justifyContent='center' gap={1} overflow="hidden" className='infostand-icon-left'>
                            <Base className="cursor-pointer icon icon-eye" />
                        </Flex>
                        <span onClick={event => GetUserProfile(avatarInfo.webID)} className="nitro-card-header-text cursor-pointer">{ avatarInfo.name }</span>
                        <Flex center position="absolute" className="end-2 nitro-card-header-close" onClick={ onClose }>
                            <FaTimes className="fa-icon w-12 h-12" />
                        </Flex>
                    </Flex>
                </Column>
                <Flex className="text-black content-area" gap={1} overflow="visible">
                    <Column className="nitro-infostand rounded" overflow="visible">
                        <Column overflow="visible" gap={1}>
                            <Column gap={1}>
                                <Flex gap={1}>
                                    <Column fullWidth className="body-image" onClick={event => GetUserProfile(avatarInfo.webID)}>
                                        <LayoutAvatarImageView figure={avatarInfo.figure} direction={4} />
                                    </Column>
                                    <Column grow alignItems="center" gap={0}>
                                        <Flex gap={1}>
                                            <Flex center className="badge-image">
                                                {avatarInfo.badges[0] && <LayoutBadgeImageView badgeCode={avatarInfo.badges[0]} showInfo={true} />}
                                            </Flex>
                                            <Flex center pointer={(avatarInfo.groupId > 0)} className="badge-image" onClick={event => GetGroupInformation(avatarInfo.groupId)}>
                                                {avatarInfo.groupId > 0 &&
                                                    <LayoutBadgeImageView badgeCode={avatarInfo.groupBadgeId} isGroup={true} showInfo={true} customTitle={avatarInfo.groupName} />}
                                            </Flex>
                                        </Flex>
                                        <Flex center gap={1}>
                                            <Flex center className="badge-image">
                                                {avatarInfo.badges[1] && <LayoutBadgeImageView badgeCode={avatarInfo.badges[1]} showInfo={true} />}
                                            </Flex>
                                            <Flex center className="badge-image">
                                                {avatarInfo.badges[2] && <LayoutBadgeImageView badgeCode={avatarInfo.badges[2]} showInfo={true} />}
                                            </Flex>
                                        </Flex>
                                        <Flex center gap={1}>
                                            <Flex center className="badge-image">
                                                {avatarInfo.badges[3] && <LayoutBadgeImageView badgeCode={avatarInfo.badges[3]} showInfo={true} />}
                                            </Flex>
                                            <Flex center className="badge-image">
                                                {avatarInfo.badges[4] && <LayoutBadgeImageView badgeCode={avatarInfo.badges[4]} showInfo={true} />}
                                            </Flex>
                                        </Flex>
                                    </Column>
                                </Flex>
                            </Column>
                            <Column gap={1}>
                                <Flex gap={1} alignItems="center" className="bg-hubGrey1D rounded">
                                    <Flex alignItems='center' justifyContent='center' gap={1} overflow="hidden" className='bg-hubGrey1L infostand-icon-left'>
                                        <Base className="icon icon-motto" />
                                    </Flex>
                                    {(avatarInfo.type !== AvatarInfoUser.OWN_USER) &&
                                        <Flex grow alignItems="center" className="motto-content">
                                            <Text fullWidth pointer wrap textBreak small variant="white">{motto}</Text>
                                        </Flex>}
                                    {avatarInfo.type === AvatarInfoUser.OWN_USER &&
                                        <Flex grow alignItems="center" gap={2}>
                                            <Flex grow alignItems="center" className="motto-content">
                                                {!isEditingMotto &&
                                                    <Text fullWidth pointer wrap textBreak small variant="white" onClick={event => setIsEditingMotto(true)}>{motto}&nbsp;</Text>}
                                                {isEditingMotto &&
                                                    <input type="text" className="motto-input fst-italic" maxLength={GetConfiguration<number>('motto.max.length', 38)} value={motto} onChange={event => setMotto(event.target.value)} onBlur={onMottoBlur} onKeyDown={onMottoKeyDown} autoFocus={true} />}
                                            </Flex>
                                        </Flex>}
                                </Flex>
                            </Column>
                            <Column gap={1}>
                                <InfoStandWidgetUserRelationshipsView relationships={relationships} />
                            </Column>
                            {(avatarInfo.carryItem > 0) &&
                                <Flex alignItems='center' overflow='hidden' className='bg-hubGrey1D rounded' gap={1}>
                                    <Flex alignItems='center' justifyContent='center' gap={1} overflow="hidden" className='bg-hubGrey1L infostand-icon-left'>
                                        <Base className="icon icon-hand" />
                                    </Flex>
                                    <Text variant="white" small wrap>
                                        {LocalizeText('infostand.text.handitem', ['item'], [LocalizeText('handitem' + avatarInfo.carryItem)])}
                                    </Text>
                                </Flex>
                            }
                            <Flex alignItems='center' overflow='hidden' className='bg-hubGrey1D rounded' gap={1}>
                                <Flex alignItems='center' justifyContent='center' gap={1} overflow="hidden" className='bg-hubGrey1L infostand-icon-left'>
                                    <Base className="icon icon-achievements-mini" />
                                </Flex>
                                <Text noWrap center variant="white" small>
                                    { avatarInfo.achievementScore }
                                </Text>
                            </Flex>
                            {GetConfiguration('user.tags.enabled') &&
                                <Column gap={1} className="mt-1">
                                    <InfoStandWidgetUserTagsView tags={GetSessionDataManager().tags} />
                                </Column>}
                        </Column>
                    </Column>
                </Flex>
            </Column>
    );
}
