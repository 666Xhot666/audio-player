import React, {forwardRef, memo, useImperativeHandle, useLayoutEffect, useRef} from "react";
import * as d3 from "d3";

export type PlaybackHandle = {
    setProgress:(progress:number)=>void;
}

const PlaybackElement = memo(forwardRef<PlaybackHandle>((props,ref) => {
    const playbackRef = useRef<SVGGElement>(null)
    const setProgress = (progress:number) => {
        if (progress<0 || progress > 100) return;
        d3.select('.playbackProgress').attr('width', `${progress}%`)
        d3.select('.playbackHandle').style('transform',`translateX(${progress}%)`)
    }

    useImperativeHandle(ref,()=>{
        return {
            setProgress
        }
    })


    useLayoutEffect(() => {
        if (!playbackRef) return;
        const playback = d3.select(playbackRef.current);
        playback.append('rect')
            .attr('class', 'playbackProgress')
            .attr('height', '100%')
            .attr('width', 0)
            .attr('fill', 'rgba(0,58,204,0.1)')
        const handler = playback.append('g').classed('playbackHandle',true);
        handler.append('line')
            .attr('x1', '0')
            .attr('x2', '0')
            .attr('y1', '0')
            .attr('y2', '100%')
            .attr('stroke-width', '1px')
            .attr('stroke', '#205703')
        handler.append("polygon")
            .attr("points", `-10,0 10,0 0,10`)
            .attr("fill", '#205703');
        return () => {
            d3.select('.playbackProgress').remove();
            d3.select('.playbackHandle').remove();
        }
    });

    return (
        <>
            <g className="playback" ref={playbackRef}></g>
        </>
    )
}));

export default PlaybackElement;