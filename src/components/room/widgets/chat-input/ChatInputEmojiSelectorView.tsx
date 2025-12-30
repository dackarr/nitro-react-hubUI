import { FC, MouseEvent, useEffect, useMemo, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { Base, Flex, Grid, NitroCardContentView, Text } from '../../../../common';

interface Emoji
{
    slug: string;
    unicodeName: string;
    group: string;
    subGroup: string;
    character: string;
    codePoint: string;
}

interface EmojiGroup
{
    slug: string;
    subCategories: string[];
}

interface ChatInputEmojiSelectorViewProps
{
    addChatEntry: (value: string) => void;
}

export const ChatInputEmojiSelectorView: FC<ChatInputEmojiSelectorViewProps> = props =>
{
    const { addChatEntry = null } = props;
    const [ target, setTarget ] = useState<(EventTarget & HTMLElement)>(null);
    const [ selectorVisible, setSelectorVisible ] = useState(false);
    const [ emojiGroups, setEmojiGroups ] = useState<EmojiGroup[]>([]);
    const [ emojis, setEmojis ] = useState<Emoji[]>([]);
    const [ selectedGroup, setSelectedGroup ] = useState<string>(null);

    useEffect(() =>
    {
        Promise.all([
            fetch('/emojis/emoji-groups.json').then(response => response.json()),
            fetch('/emojis/emojis.json').then(response => response.json())
        ])
        .then(([ groups, emojis ]) =>
        {
            setEmojiGroups(groups);
            setEmojis(emojis);
            if(groups.length) setSelectedGroup(groups[0].slug);
        })
        .catch(err => console.error(err));
    }, []);

    const toggleSelector = (event: MouseEvent<HTMLElement>) =>
    {
        let visible = false;

        setSelectorVisible(prevValue =>
        {
            visible = !prevValue;

            return visible;
        });

        if(visible) setTarget((event.target as (EventTarget & HTMLElement)));
    }

    useEffect(() =>
    {
        if(selectorVisible) return;

        setTarget(null);
    }, [ selectorVisible ]);

    const currentEmojis = useMemo(() =>
    {
        if(!selectedGroup) return [];

        return emojis.filter(emoji => emoji.group === selectedGroup);
    }, [ emojis, selectedGroup ]);

    const getGroupIcon = (slug: string) =>
    {
        switch(slug)
        {
            case 'smileys-emotion':
                return '😀';
            case 'people-body':
                return '👋';
            case 'component':
                return '🏻';
            case 'animals-nature':
                return '🐻';
            case 'food-drink':
                return '🍔';
            case 'travel-places':
                return '🚗';
            case 'activities':
                return '⚽';
            case 'objects':
                return '💡';
            case 'symbols':
                return '❤️';
            case 'flags':
                return '🏳️';
            case 'Alt Codes':
                return 'ƒ';
            default:
                return slug;
        }
    }

    return (
        <>
            <Base pointer className="icon icon-emojis" onClick={ toggleSelector } />
            <Overlay show={ selectorVisible } target={ target } placement="top" rootClose onHide={ () => setSelectorVisible(false) }>
                <Popover className="hub-emoji-picker image-rendering-pixelated">
                    <NitroCardContentView overflow="hidden" className="bg-transparent">
                        <Flex style={ { overflowY: 'hidden' } } gap={ 1 } className="pb-1 h-25 w-100 border-bottom">
                            { emojiGroups.map(group =>
                            {
                                return (
                                    <Base key={ group.slug } pointer className={ `p-1 rounded ${ (selectedGroup === group.slug) ? 'bg-primary text-white' : 'bg-light' }` } onClick={ () => setSelectedGroup(group.slug) }>
                                        <Text fontSize={4} bold>{ getGroupIcon(group.slug) }</Text>
                                    </Base>
                                );
                            }) }
                        </Flex>
                        <Grid columnCount={ 5 } overflow="auto" className="pt-1">
                            { currentEmojis.map((emoji, index) =>
                            {
                                return (
                                    <div key={ index } className="layout-grid-item layout-inner" onClick={ event => addChatEntry(emoji.character) }>
                                        { emoji.character }
                                    </div>
                                );
                            }) }
                        </Grid>
                    </NitroCardContentView>
                </Popover>
            </Overlay>
        </>
    );
}
