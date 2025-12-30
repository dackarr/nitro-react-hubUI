import { BotRemoveComposer } from '@nitrots/nitro-renderer';
import { FC, useMemo } from 'react';
import { FaTimes } from 'react-icons/fa';
import { AvatarInfoRentableBot, BotSkillsEnum, GetUserProfile, LocalizeText, SendMessageComposer } from '../../../../../api';
import { Base, Button, Column, Flex, LayoutAvatarImageView, LayoutBadgeImageView, Text, UserProfileIconView } from '../../../../../common';

interface InfoStandWidgetRentableBotViewProps
{
    avatarInfo: AvatarInfoRentableBot;
    onClose: () => void;
}

export const InfoStandWidgetRentableBotView: FC<InfoStandWidgetRentableBotViewProps> = props =>
{
    const { avatarInfo = null, onClose = null } = props;

    const canPickup = useMemo(() =>
    {
        if(avatarInfo.botSkills.indexOf(BotSkillsEnum.NO_PICK_UP) >= 0) return false;

        if(!avatarInfo.amIOwner && !avatarInfo.amIAnyRoomController) return false;

        return true;
    }, [ avatarInfo ]);

    const pickupBot = () => SendMessageComposer(new BotRemoveComposer(avatarInfo.webID));
    
    if(!avatarInfo) return;

    return (
        <Column gap={1}>
            <Column gap={0} className='nitro-card rounded-1 theme-primary-dark'>
                <Column center position="relative" className='container-fluid nitro-card-header'>
                    <Flex gap={1} fullWidth>
                        <span className="nitro-card-header-text cursor-pointer">{ avatarInfo.name }</span>
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
                                    <Column fullWidth className="body-image bot">
                                        <LayoutAvatarImageView figure={ avatarInfo.figure } direction={ 4 } />
                                    </Column>
                                    <Column grow center gap={ 0 }>
                                        { (avatarInfo.badges.length > 0) && avatarInfo.badges.map(result =>
                                        {
                                            return <LayoutBadgeImageView key={ result } badgeCode={ result } showInfo={ true } />;
                                        }) }
                                    </Column>
                                </Flex>
                            </Column>
                            <Column gap={1}>
                                <Flex gap={1} alignItems="center" className="bg-hubGrey1D rounded">
                                    <Flex alignItems='center' justifyContent='center' gap={1} overflow="hidden" className='bg-hubGrey1L infostand-icon-left'>
                                        <Base className="icon icon-motto" />
                                    </Flex>
                                    <Flex grow alignItems="center" className="motto-content">
                                        <Text fullWidth pointer wrap textBreak small variant="white">{ avatarInfo.motto }</Text>
                                    </Flex>
                                </Flex>
                            </Column>
                            <Column gap={1}>
                                <Flex alignItems='center' overflow='hidden' className='bg-hubGrey1D rounded' gap={1}>
                                    <Flex alignItems='center' justifyContent='center' gap={1} overflow="hidden" className='bg-hubGrey1L infostand-icon-left'>
                                        <UserProfileIconView userId={ avatarInfo.ownerId } />
                                    </Flex>
                                    <Text onClick={ event => GetUserProfile(avatarInfo.ownerId) } pointer variant="white" small wrap>
                                        { LocalizeText('furni.owner', [ 'name' ], [ avatarInfo.ownerName ]) }
                                    </Text>
                                </Flex>
                                { (avatarInfo.carryItem > 0) &&
                                    <Flex alignItems='center' overflow='hidden' className='bg-hubGrey1D rounded' gap={1}>
                                        <Flex alignItems='center' justifyContent='center' gap={1} overflow="hidden" className='bg-hubGrey1L infostand-icon-left'>
                                            <Base className="icon icon-handitem" />
                                        </Flex>
                                        <Text fullWidth pointer wrap textBreak small variant="white">
                                            { LocalizeText('handitem' + avatarInfo.carryItem) }
                                        </Text>
                                    </Flex>
                                }
                            </Column>
                        </Column>
                    </Column>
                </Flex>
            </Column>
            { canPickup &&
            <Flex justifyContent="end">
                <Button variant="dark" onClick={ pickupBot }>{ LocalizeText('infostand.button.pickup') }</Button>
            </Flex> }
        </Column>
    );
}
