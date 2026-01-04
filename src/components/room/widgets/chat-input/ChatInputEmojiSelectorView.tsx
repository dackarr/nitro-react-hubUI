import { FC, MouseEvent, useEffect, useMemo, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { Base, Button, Flex, Grid, NitroCardContentView } from '../../../../common';

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
    const [ searchQuery, setSearchQuery ] = useState<string>('');

    useEffect(() =>
    {
        Promise.all([
            fetch('./emojis/emoji-groups.json').then(response => response.json()),
            fetch('./emojis/emojis.json').then(response => response.json())
        ])
        .then(([ groups, emojis ]) =>
        {
            setEmojiGroups(groups);
            setEmojis(emojis);
            if(groups.length) setSelectedGroup(groups[0].slug);
        })
        .catch(err => console.error(err));
    }, []);

    const getGroupText = (slug: string) =>
    {
        switch(slug)
        {
            case 'smileys-emotion':
                return 'Smileys & Emotion';
            case 'people-body':
                return 'People & Body';
            case 'animals-nature':
                return 'Animals & Nature';
            case 'food-drink':
                return 'Food & Drink';
            case 'travel-places':
                return 'Travel & Places';
            case 'activities':
                return 'Activities';
            case 'objects':
                return 'Objects';
            case 'symbols':
                return 'Symbols';
            case 'flags':
                return 'Flags';
            case 'Alt Codes':
                return 'Alt Codes';
            default:
                return slug;
        }
    }

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
        let filteredEmojis = emojis;

        if(searchQuery.length > 0)
        {
            filteredEmojis = filteredEmojis.filter(emoji => emoji.unicodeName.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        else if(selectedGroup)
        {
            filteredEmojis = filteredEmojis.filter(emoji => emoji.group === selectedGroup);
        }

        return filteredEmojis;
    }, [ emojis, selectedGroup, searchQuery ]);

    return (
        <>
            <Base pointer className="icon icon-emojis" onClick={ toggleSelector } />
            <Overlay show={ selectorVisible } target={ target } placement="top" rootClose onHide={ () => setSelectorVisible(false) }>
                <Popover className="hub-emoji-picker image-rendering-pixelated">
                    <NitroCardContentView gap={0} overflow="hidden" className="bg-transparent">
                        <select className="form-select form-select-sm mb-1" value={ selectedGroup } onChange={ event => setSelectedGroup(event.target.value) }>
                            { emojiGroups.map(group =>
                            {
                                return <option key={ group.slug } value={ group.slug }>{ getGroupText(group.slug) }</option>
                            }) }
                        </select>
                        <Flex alignItems="center" className="layout-search">
                            <Button variant="primary" className="search-button">
                                <Base className="icon icon-search" />
                            </Button>
                            <input type="text" className="form-control form-control-sm" placeholder="Search emojis..." value={ searchQuery } onChange={ event => setSearchQuery(event.target.value) } />
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
