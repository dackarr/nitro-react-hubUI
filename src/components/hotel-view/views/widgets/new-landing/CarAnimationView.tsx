import { FC, useEffect, useState } from 'react';

const carColors = [ 'red', 'yellow', 'blue', 'green', 'black', 'multi', 'gray' ];

interface CarAnimationViewProps {
    className?: string | undefined;
}

export const CarAnimationView: FC<CarAnimationViewProps> = props =>
{
    const [ carColor, setCarColor ] = useState<string>('multi');

    useEffect(() =>
    {
        const timer = setInterval(() =>
        {
            const randomColor = carColors[Math.floor(Math.random() * carColors.length)];
            setCarColor(randomColor);
        }, 15000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="animate__animated animation-container">
            <div className="car">
                <div
                    className={ `car-background ${ carColor }` }
                />
                <div className="car-image"/>
            </div>
        </div>
    );
};
