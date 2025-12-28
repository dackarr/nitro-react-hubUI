import { ColorConverter, GetTicker, IRoomRenderingCanvas, RoomPreviewer, TextureUtils } from '@nitrots/nitro-renderer';
import { CSSProperties, FC, MouseEvent, ReactNode, useEffect, useRef } from 'react';

export interface LayoutRoomPreviewerViewProps
{
    roomPreviewer: RoomPreviewer;
    height?: number | string; // Permitimos string para que puedas usar porcentajes como '50%'
    fullHeight?: boolean;
    children?: ReactNode;
}

export const LayoutRoomPreviewerView: FC<LayoutRoomPreviewerViewProps> = props =>
{
    const { roomPreviewer = null, height = 0, fullHeight = false, children = null } = props;
    const elementRef = useRef<HTMLDivElement>(null);

    const onClick = (event: MouseEvent<HTMLDivElement>) =>
    {
        if(!roomPreviewer) return;

        if(event.shiftKey) roomPreviewer.changeRoomObjectDirection();
        else roomPreviewer.changeRoomObjectState();
    };

    useEffect(() =>
    {
        if (!roomPreviewer || !elementRef.current) return;

        const element = elementRef.current;
        let renderingCanvas: IRoomRenderingCanvas = null;

        const update = (time: number) =>
        {
            if (!roomPreviewer || !renderingCanvas) return;

            roomPreviewer.updatePreviewRoomView();

            if (!renderingCanvas.canvasUpdated) return;

            element.style.backgroundImage = `url(${ TextureUtils.generateImageUrl(renderingCanvas.master) })`;
        };

        const onResize = (entries: ResizeObserverEntry[]) =>
        {
            if (!entries || !entries.length) return;

            const entry = entries[0];
            const { width, height } = entry.contentRect;

            if (width === 0 || height === 0) return;

            const scale = 1.5;
            const canvasWidth = width * scale;
            const canvasHeight = height * scale;

            if (!renderingCanvas)
            {
                const computed = window.getComputedStyle(element, null);
                let backgroundColor = computed.backgroundColor;
                backgroundColor = ColorConverter.rgbStringToHex(backgroundColor);
                backgroundColor = backgroundColor.replace('#', '0x');
                roomPreviewer.backgroundColor = parseInt(backgroundColor, 16);

                roomPreviewer.getRoomCanvas(canvasWidth, canvasHeight);
                renderingCanvas = roomPreviewer.getRenderingCanvas();
            }
            else
            {
                roomPreviewer.modifyRoomCanvas(canvasWidth, canvasHeight);
            }

            if (renderingCanvas) renderingCanvas.canvasUpdated = true;

            update(-1);
        };

        GetTicker().add(update);
        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(element);

        return () =>
        {
            resizeObserver.disconnect();
            GetTicker().remove(update);
            roomPreviewer.dispose();
        }
    }, [ roomPreviewer ]);

    const getStyle = (): CSSProperties =>
    {
        const style: CSSProperties = {
            backgroundPosition: '50% 50%',
            backgroundRepeat: 'no-repeat'
        };

        if (fullHeight) style.height = '100%';
        else if (typeof height === 'string') style.height = height;
        else if (typeof height === 'number' && height > 0) style.height = `${ height }px`;

        return style;
    }

    return (
        <div className="room-preview-container h-100 position-relative">
            <div ref={ elementRef } className="room-preview-image" style={ getStyle() } onClick={ onClick } />
            { children }
        </div>
    );
}
