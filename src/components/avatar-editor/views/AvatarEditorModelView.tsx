import { Dispatch, FC, SetStateAction, useCallback, useEffect, useState } from 'react';
import { CategoryData, FigureData, IAvatarEditorCategoryModel } from '../../../api';
import { Column, Flex, Grid } from '../../../common';
import { AvatarEditorIcon } from './AvatarEditorIcon';
import { AvatarEditorFigureSetView } from './figure-set/AvatarEditorFigureSetView';
import { AvatarEditorPaletteSetView } from './palette-set/AvatarEditorPaletteSetView';
export interface AvatarEditorModelViewProps
{
    model: IAvatarEditorCategoryModel;
    gender: string;
    setGender: Dispatch<SetStateAction<string>>;
}

export const AvatarEditorModelView: FC<AvatarEditorModelViewProps> = props =>
{
    const { model = null, gender = null, setGender = null } = props;
    const [ activeCategory, setActiveCategory ] = useState<CategoryData>(null);
    const [ maxPaletteCount, setMaxPaletteCount ] = useState(1);

    const selectCategory = useCallback((name: string) =>
    {
        const category = model.categories.get(name);

        if(!category) return;

        category.init();

        setActiveCategory(category);

        for(const part of category.parts)
        {
            if(!part || !part.isSelected) continue;

            setMaxPaletteCount(part.maxColorIndex || 1);

            break;
        }
    }, [ model ]);

    useEffect(() =>
    {
        model.init();

        for(const name of model.categories.keys())
        {
            selectCategory(name);

            break;
        }
    }, [ model, selectCategory ]);

    if(!model || !activeCategory) return null;

    return (
        <Grid>
            <Column size={ 1 }>
                <Flex gap={ 1 }>
                    { model.canSetGender &&
                        <>
                            <Flex center pointer className="btn btn-muted category-item px-2" onClick={ event => setGender(FigureData.MALE) }>
                                <AvatarEditorIcon icon="male" selected={ (gender === FigureData.MALE) } />
                            </Flex>
                            <Flex center pointer className="btn btn-muted category-item px-2" onClick={ event => setGender(FigureData.FEMALE) }>
                                <AvatarEditorIcon icon="female" selected={ (gender === FigureData.FEMALE) } />
                            </Flex>
                        </> }
                    { !model.canSetGender && model.categories && (model.categories.size > 0) && Array.from(model.categories.keys()).map(name =>
                    {
                        const category = model.categories.get(name);

                        return (
                            <Flex center pointer key={ name } className="btn btn-muted category-item px-2" onClick={ event => selectCategory(name) }>
                                <AvatarEditorIcon icon={ category.name } selected={ (activeCategory === category) } />
                            </Flex>
                        );
                    }) }
                </Flex>
            </Column>
            <Column size={ 12 } overflow="hidden">
                <Column size={ 10 } overflow="hidden">
                    <AvatarEditorFigureSetView model={ model } category={ activeCategory } setMaxPaletteCount={ setMaxPaletteCount } />
                </Column>
                <Column className='color-picker' size={ 12 } overflow="hidden">
                    { (maxPaletteCount >= 1) &&
                        <Grid>
                            <Column size={ (maxPaletteCount === 1) ? 12 : 6 } overflow="hidden">
                                <AvatarEditorPaletteSetView model={ model } category={ activeCategory } paletteSet={ activeCategory.getPalette(0) } paletteIndex={ 0 } />
                            </Column>
                            { (maxPaletteCount === 2) &&
                                <Column size={ 6 } overflow="hidden">
                                    <AvatarEditorPaletteSetView model={ model } category={ activeCategory } paletteSet={ activeCategory.getPalette(1) } paletteIndex={ 1 } />
                                </Column> }
                        </Grid> }
                </Column>
            </Column>
        </Grid>
    );
}
