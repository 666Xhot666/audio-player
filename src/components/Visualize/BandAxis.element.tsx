import React, {memo, useEffect, useLayoutEffect, useRef} from "react";
import * as d3 from "d3";

type BandAxisProps = {
    duration: number;
}
const BandAxisElement = memo(({duration}:BandAxisProps) => {
    const bandAxisRef = useRef<SVGGElement>(null)
    const getTimeDomain = (duration:number,step:number=30)=>{
        const steps = Math.ceil(duration/step);
        const timeFormat = Intl.DateTimeFormat('us', {minute: "numeric",
            second: "numeric"})

        return Array.from({length:steps-1}, (_,index) => {
            const date = new Date(1970,0,1,0,0,0);
            date.setSeconds(step*(index+1));
            return timeFormat.format(date);
        })
    }
    const scale = () => {
        if (!bandAxisRef.current) return;
        const width = bandAxisRef.current.parentElement?.clientWidth ?? 0;
        const bandScale = d3.scaleBand(timeDomain,[0,width])
        d3.select(bandAxisRef.current)
            .call(d3.axisBottom(bandScale.copy()))
    }
    const timeDomain = getTimeDomain(duration);
    useLayoutEffect(() => {
        if (!bandAxisRef.current) return;
        d3.select(bandAxisRef.current)
            .attr('stroke-width', 1)
            .style('color', '#205703')
            .style('font-size', 12)
            .style('font-wight', 500)
            .style('user-select', 'none')
        scale()
    });
    useEffect(() => {
        window.addEventListener('resize',scale)
        return () => {
            window.removeEventListener('resize',scale)
        }
    });
    return (
        <g className="bandAxis" ref={bandAxisRef}></g>
    )
})

export default BandAxisElement;