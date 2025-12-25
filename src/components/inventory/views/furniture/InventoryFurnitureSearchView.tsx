import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { GroupItem, LocalizeText } from '../../../../api';
import {Base, Button, Flex} from '../../../../common';

export interface InventoryFurnitureSearchViewProps
{
    groupItems: GroupItem[];
    setGroupItems: Dispatch<SetStateAction<GroupItem[]>>;
}

export const InventoryFurnitureSearchView: FC<InventoryFurnitureSearchViewProps> = props =>
{
    const { groupItems = [], setGroupItems = null } = props;
    const [ searchValue, setSearchValue ] = useState('');

    useEffect(() =>
    {
        let filteredGroupItems = [ ...groupItems ];

        if(searchValue && searchValue.length)
        {
            const comparison = searchValue.toLocaleLowerCase();

            filteredGroupItems = groupItems.filter(item =>
            {
                if(comparison && comparison.length)
                {
                    if(item.name.toLocaleLowerCase().includes(comparison)) return item;
                }

                return null;
            });
        }

        setGroupItems(filteredGroupItems);
    }, [ groupItems, setGroupItems, searchValue ]);

    return (
        <Flex className="layout-search w-100">
            <Flex pointer alignItems="center" justifyContent="center" className="search-button">
                <Base className="icon icon-search" />
            </Flex>
            <input type="text" className="form-control form-control-sm" placeholder={ LocalizeText('generic.search') } value={ searchValue } onChange={ event => setSearchValue(event.target.value) } />
        </Flex>
    );
}
