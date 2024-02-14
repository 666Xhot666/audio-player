import React, {useCallback, useLayoutEffect, useRef} from "react";
import './volumeInput.css';

type VolumeInputProps = {
    defaultValue?:number;
    max?:number;
    min?:number;
    step?:number;
    onChange?:(value:number)=>void;
}

const VolumeInputElement = ({
        max=1,
        min=-1,
        defaultValue=1,
        step=0.001,
        onChange=console.log
                            }:VolumeInputProps) => {

    const backgroundRef = useRef<HTMLDivElement>(null);
    const filledRef = useRef<HTMLDivElement>(null);
    const draggable = useRef(false);
    const range = useRef(max-min);
    const lastCallValue = useRef(defaultValue-min);

    const setValue = useCallback((value:number) => {
        value = value>0?value<100?value:100:0;
        if (value<0) value=0;
        if (value>100) value=100;
        if (!backgroundRef.current || !filledRef.current) return;
        filledRef.current.style.width = `${value}%`;
        const currentWidth = backgroundRef.current.clientWidth * value / 100
        const restWidth = backgroundRef.current.clientWidth - currentWidth;
        if (currentWidth>20 && restWidth>20) {
            filledRef.current.style.borderTopRightRadius = '0px';
            filledRef.current.style.borderBottomRightRadius = '0px';
        } else {
            const radius = 20-Math.min(currentWidth,restWidth)
            filledRef.current.style.borderTopRightRadius = `${radius}px`;
            filledRef.current.style.borderBottomRightRadius = `${radius}px`;
        }
    },[])

    useLayoutEffect(()=>{
        setValue((defaultValue-min)/range.current*100)
    })

    const mouseMoveHandler = (event:React.MouseEvent<HTMLDivElement>) => {
        if (!draggable.current || !backgroundRef.current ) return;
        const currentValue = range.current * (event.clientX - backgroundRef.current.offsetLeft)/backgroundRef.current.clientWidth;
        setValue(currentValue/range.current*100);
        if (Math.abs(lastCallValue.current - currentValue) < step) return;
        lastCallValue.current=currentValue;
        onChange(currentValue+min)
    }

    const mouseDownHandler = (event:React.MouseEvent<HTMLDivElement>) => {
        if (!backgroundRef.current || !filledRef.current) return;
        const width = backgroundRef.current.clientWidth
        const left = filledRef.current.offsetLeft;
        const currValue = (event.clientX - left)/width;
        setValue(currValue*100);
        let volume = range.current*currValue+min;
        volume = volume > min?volume<max?volume:max:min;
        onChange(volume);
        draggable.current = true;
    }

    return (
            <div className="volumeInput"
                 onMouseDown={mouseDownHandler}
                 onMouseUp={() => {
                     draggable.current = false
                 }}
                 onMouseLeave={() => {
                     draggable.current = false
                 }}
                 onMouseMove={mouseMoveHandler}
            >
                <div className="volumeInput_background" ref={backgroundRef}>
                    <div className="volumeInput_filled" ref={filledRef}></div>
                </div>

            </div>
    )
}

export default VolumeInputElement
