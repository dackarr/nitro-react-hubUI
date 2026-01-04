import { RelationshipStatusEnum, RelationshipStatusInfo } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { GetUserProfile, LocalizeText } from '../../../../../api';
import { Base, Flex, Text } from '../../../../../common';

interface InfoStandWidgetUserRelationshipsRelationshipItemViewProps
{
    type: number;
    relationship: RelationshipStatusInfo;
}

export const InfoStandWidgetUserRelationshipsRelationshipItemView: FC<InfoStandWidgetUserRelationshipsRelationshipItemViewProps> = props =>
{
    const { type = -1, relationship = null } = props;

    if(!relationship) return null;

    const relationshipName = RelationshipStatusEnum.RELATIONSHIP_NAMES[type].toLocaleLowerCase();

    return (
        <Flex alignItems='center' overflow='hidden' className='bg-hubGrey1D rounded' gap={1}>
            <Flex alignItems='center' justifyContent='center' gap={1} overflow="hidden" className='bg-hubGrey1L infostand-icon-left'>
                <Base className={ `nitro-friends-spritesheet icon-${ relationshipName }` } />
            </Flex>
            <Text small variant="white" onClick={ event => GetUserProfile(relationship.randomFriendId) }>
                <u className='cursor-pointer'>{ relationship.randomFriendName }</u>
                { (relationship.friendCount > 1) && (' ' + LocalizeText(`extendedprofile.relstatus.others.${ relationshipName }`, [ 'count' ], [ (relationship.friendCount - 1).toString() ])) }
            </Text>
        </Flex>
    );
}
