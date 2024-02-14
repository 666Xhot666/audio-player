import * as d3 from "d3";
import React, {memo, useCallback, useLayoutEffect, useRef} from "react";

type WaveGraphProps = {
    audioData:number[];
}
const WaveGraph = memo(({audioData}:WaveGraphProps) => {
    const waveRef = useRef<SVGGElement>(null)
    const getXScale = useCallback((width:number)=>{
        return d3.scaleLinear([0,width]).domain([0,audioData.length-1]);
    },[audioData])
    const getYScale = useCallback((height:number)=>{
        return d3.scaleLinear([0,height]).domain(d3.extent(audioData).map(x=>Number(x)));
    },[audioData])
    useLayoutEffect(() => {
        if (! waveRef.current) return;
        const height = waveRef.current.parentElement?.clientHeight ?? 0;
        const width = waveRef.current.parentElement?.clientWidth ?? 0;
        const xScale = getXScale(width);
        const yScale = getYScale(height);
        const band = width/audioData.length

         const wave = d3.select(waveRef.current).append('g')
        wave.classed('wave_g',true)
            .classed('wave_fadeIn',true)
            .attr('width','100%')
            .attr('height', '100%')
            .style('transform', 'translateY(50%)')
            .selectAll('rect')
            .data(audioData)
            .join('rect')
            .attr('fill', '#205703')
            .attr('height', d => `${yScale(d)/height*100}%`)
            .attr('width', () => `${band/width*100}%`)
            .attr('x', (_, i) => `${xScale(i)/width*100}%`)
            .attr('y', d => `-${yScale(d)/height*50}%`)
            .attr('rx', band/2)
            .attr('ry', band/2);
        return () => {
            wave.classed('wave_fadeOut',true).remove()
        }
    });
    return (
        <g className="wave " ref={waveRef}></g>
    )
})

export default WaveGraph