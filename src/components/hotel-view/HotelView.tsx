import
    {
        NitroConfiguration,
        RoomSessionEvent
    } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { GetConfiguration, GetSessionDataManager, LocalizeText } from '../../api';
import { Column, Flex, LayoutAvatarImageView, Text } from '../../common';
import { useRoomSessionManagerEvent, useSessionInfo } from '../../hooks';
import { WidgetSlotView } from './views/widgets/WidgetSlotView';
import { CarAnimationView } from './views/widgets/new-landing/CarAnimationView';

const widgetSlotCount = 7;

export const HotelView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(true);
    const [ isFullscreen, setIsFullscreen ] = useState(false);
    const { userFigure = null, userInfo = null } = useSessionInfo();
    const timeOffset = GetConfiguration<number>('hotelview.time.offset', 0);

    const getIsNight = () =>
    {
        const now = new Date();
        const hotelTime = new Date(now.getTime() + (timeOffset * 3600000));
        const hour = hotelTime.getUTCHours();

        return (hour >= 18 || hour < 7);
    };

    const [ isFilter, setFilter ] = useState(getIsNight);
    const [ dynamicText, setDynamicText ] = useState<string>(
        `${ LocalizeText('landing.view.generic.welcome.content') }`
    );

    useEffect(() =>
    {
        const interval = setInterval(() => setFilter(getIsNight()), 5000);

        return () => clearInterval(interval);
    }, [ timeOffset ]);

    useRoomSessionManagerEvent<RoomSessionEvent>([
        RoomSessionEvent.CREATED,
        RoomSessionEvent.ENDED ], event =>
    {
        switch(event.type)
        {
            case RoomSessionEvent.CREATED:
                setIsVisible(false);
                return;
            case RoomSessionEvent.ENDED:
                setIsVisible(event.openLandingView);
                return;
        }
    });

    useEffect(() =>
    {
        if (!userInfo || !userInfo.lastAccessedDate) return;

        const timer = setTimeout(() =>
        {
            setDynamicText(prev => prev.replace('%lastlogin%', userInfo.lastAccessedDate));
        }, 1500);

        return () => clearTimeout(timer);
    }, [ userInfo ]);

    useEffect(() =>
    {
        const handleFullscreenChange = () =>
        {
            const isFullscreen = !!document.fullscreenElement; // Verifica si hay algún elemento en fullscreen
            setIsFullscreen(isFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Para compatibilidad adicional
        document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox
        document.addEventListener('msfullscreenchange', handleFullscreenChange); // IE/Edge

        return () => 
        {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    if(!isVisible) return null;

    const backgroundColor = GetConfiguration('hotelview')['images']['background.colour'];
    const background = NitroConfiguration.interpolate(GetConfiguration('hotelview')['images']['background']);
    const sun = NitroConfiguration.interpolate(GetConfiguration('hotelview')['images']['sun']);
    const drape = NitroConfiguration.interpolate(GetConfiguration('hotelview')['images']['drape']);
    const left = NitroConfiguration.interpolate(GetConfiguration('hotelview')['images']['left']);
    const rightRepeat = NitroConfiguration.interpolate(GetConfiguration('hotelview')['images']['right.repeat']);
    const right = NitroConfiguration.interpolate(GetConfiguration('hotelview')['images']['right']);

    return (
        <div className="w-100 h-100 nitro-hotel-view"
            style={ (backgroundColor && backgroundColor) ? { background: backgroundColor } : {} }>
            <div className="container h-100 w-100 py-3 overflow-hidden landing-widgets">
                <div className="row h-100">
                    <div className="col-9 h-100 d-flex flex-column">
                        <WidgetSlotView
                            widgetSlot={ 1 }
                            widgetType={ GetConfiguration('hotelview')['widgets']['slot.' + 1 + '.widget'] }
                            widgetConf={ GetConfiguration('hotelview')['widgets']['slot.' + 1 + '.conf'] }
                            className="col-6"
                        />
                        <div className="col-12 row mx-0">
                            <WidgetSlotView
                                widgetSlot={ 2 }
                                widgetType={ GetConfiguration('hotelview')['widgets']['slot.' + 2 + '.widget'] }
                                widgetConf={ GetConfiguration('hotelview')['widgets']['slot.' + 2 + '.conf'] }
                                className="col-7"
                            />
                            <WidgetSlotView
                                widgetSlot={ 3 }
                                widgetType={ GetConfiguration('hotelview')['widgets']['slot.' + 3 + '.widget'] }
                                widgetConf={ GetConfiguration('hotelview')['widgets']['slot.' + 3 + '.conf'] }
                                className="col-5"
                            />
                            <WidgetSlotView
                                widgetSlot={ 4 }
                                widgetType={ GetConfiguration('hotelview')['widgets']['slot.' + 4 + '.widget'] }
                                widgetConf={ GetConfiguration('hotelview')['widgets']['slot.' + 4 + '.conf'] }
                                className="col-7"
                            />
                            <WidgetSlotView
                                widgetSlot={ 5 }
                                widgetType={ GetConfiguration('hotelview')['widgets']['slot.' + 5 + '.widget'] }
                                widgetConf={ GetConfiguration('hotelview')['widgets']['slot.' + 5 + '.conf'] }
                                className="col-5"
                            />
                        </div>
                        <WidgetSlotView
                            widgetSlot={ 6 }
                            widgetType={ GetConfiguration('hotelview')['widgets']['slot.' + 6 + '.widget'] }
                            widgetConf={ GetConfiguration('hotelview')['widgets']['slot.' + 6 + '.conf'] }
                            className="mt-auto"
                        />
                    </div>
                    <div className="col-3 h-100">
                        <WidgetSlotView
                            widgetSlot={ 7 }
                            widgetType={ GetConfiguration('hotelview')['widgets']['slot.' + 7 + '.widget'] }
                            widgetConf={ GetConfiguration('hotelview')['widgets']['slot.' + 7 + '.conf'] }
                        />
                    </div>
                </div>
            </div>
            <div className={`w-100 h-100 relative hotelview${ isFilter ? '-filtered' : '' }`} style={{zIndex: 5}}>
                <div className='w-100 h-100 relative'>
                    <div className={ `right ${(right && right.length) ? 'grass' : ''} position-absolute z-n1 ${ isFullscreen ? 'hotelview-fullscreen' : '' }` }/>
                    <div className={ `right ${(right && right.length) ? 'crossroads' : ''} position-absolute ${ isFullscreen ? 'hotelview-fullscreen' : '' }` }/>
                    <div className={ `drape position-absolute ${ isFullscreen ? 'hotelview-fullscreen' : '' }` }
                        style={ (drape && drape.length) ? { backgroundImage: `url(${ drape })` } : {} }/>
                    <div className={ `left ${ (left && left.length) ? 'left-normal' : '' } position-absolute ${ isFullscreen ? 'hotelview-fullscreen' : '' }` }>
                        <div className={ `left-image ${ (left && left.length) ? 'left-normal' : '' } position-absolute ${ isFullscreen ? 'hotelview-fullscreen' : '' }` }/>
                        { isFilter &&
                            <div className="position-absolute night-windows"/>
                        }
                        <div className={`position-absolute hotelview${ isFilter ? '-filtered' : '' } top-0 start-0 w-100 h-100`} style={{ zIndex: 4, pointerEvents: 'none' }}>
                                <Flex className="avatar-image">
                                    <LayoutAvatarImageView figure={ userFigure } direction={ 2 }/>
                                </Flex>
                                <Flex style={ { zIndex: 3 } } className="welcome-message">
                                    <Column gap={ 1 } className="text-welcome-message">
                                        <Text
                                            className="text-black font-bold">{ LocalizeText('landing.view.generic.welcome.title').replace('%username%', GetSessionDataManager().userName) }
                                        </Text>
                                        <Text className="text-black subtitle">{ dynamicText }</Text>
                                    </Column>
                                </Flex>
                        </div>
                        <div className={`position-absolute hotelview${ isFilter ? '-filtered' : '' } top-0 start-0 w-100 h-100`} style={{ zIndex: 20, pointerEvents: 'none' }}>
                            <CarAnimationView />
                        </div>
                        <div className={ `sun overlay position-absolute ${ isFullscreen ? 'hotelview-fullscreen' : '' }` }/>
                    </div>
                    <div className={ `right-repeat position-absolute ${ isFullscreen ? 'hotelview-fullscreen' : '' }` }/>
                </div>
            </div>
        </div>
    );
};
