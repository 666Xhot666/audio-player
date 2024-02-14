import React, {useCallback, useLayoutEffect, useRef} from "react";
import './ControlButton.css'
import * as d3 from "d3";

type ControlButtonProps = {
    controlButtonType: 'Play'|'Pause'|'Stop'|'Repeat',
    onClick?():void,
}

const ControlButtonElement = ({onClick=()=>{}, controlButtonType='Play'}:ControlButtonProps) => {
    const svgRef = useRef<SVGSVGElement>(null)

    const config = {
        buttonColor: '#111',
        padding: 8,
    }

    useLayoutEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current)
        const width = svgRef.current.clientWidth
        const height = svgRef.current.clientHeight
        const {padding} = config;

        switch (controlButtonType) {
            case "Play":
                svg.append("polygon")
                    .classed('img',true)
                    .attr("points", `${width/4+padding/2},${padding} ${width/4+padding/2},${height-padding} ${width-padding},${height/2}`)
                    .attr("fill", config.buttonColor);
                break;
            case "Pause":
                const sectionHeight = (height-padding*2)/Math.SQRT2;
                const sectionWidth = (width-padding*2)/Math.SQRT2/3;
                const img = svg.append("g")
                    .classed('img',true)
                    .attr('width', '100%')
                    .attr('height', '100%')
                img.append("rect")
                    .attr("x", (width-sectionWidth*3)/2)
                    .attr("y", (height-sectionHeight)/2)
                    .attr("width", sectionWidth)
                    .attr("height", sectionHeight)
                    .attr("fill", config.buttonColor);
                img.append("rect")
                    .attr("x", (width-sectionWidth*3)/2+2*sectionWidth)
                    .attr("y", (height-sectionHeight)/2)
                    .attr("width", sectionWidth)
                    .attr("height", sectionHeight)
                    .attr("fill", config.buttonColor);
                break;
            case "Stop":
                const squareWidth = (width-padding*2)/Math.SQRT2;
                svg.append("rect")
                    .classed('img',true)
                    .attr("x", (width-squareWidth)/2)
                    .attr("y", (height-squareWidth)/2)
                    .attr("width", squareWidth)
                    .attr("height", squareWidth)
                    .attr("fill", config.buttonColor);
                break;
            case "Repeat":
                svg.attr('viewBox', '0 0 24 24')
                svg.append('path')
                    .classed('img',true)
                    .attr('d',"M13.1459 11.0499L12.9716 9.05752 L15.3462 8.84977C14.4471 7.98322 13.2242 7.4503 11.8769 7.4503C9.11547 7.4503 6.87689 9.68888 6.87689 12.4503C6.87689 15.2117 9.11547 17.4503 11.8769 17.4503C13.6977 17.4503 15.2911 16.4771 16.1654 15.0224L18.1682 15.5231C17.0301 17.8487 14.6405 19.4503 11.8769 19.4503C8.0109 19.4503 4.87689 16.3163 4.87689 12.4503C4.87689 8.58431 8.0109 5.4503 11.8769 5.4503C13.8233 5.4503 15.5842 6.24474 16.853 7.52706L16.6078 4.72412L18.6002 4.5498L19.1231 10.527L13.1459 11.0499Z")
                    .attr('fill', config.buttonColor);
                break;
        }
        return () => {
            svg.select('.img').remove()
        }
    },[]);
    return (
        <button className={`controlButton`} onClick={onClick} >
            <svg width="100%" height="100%" ref={svgRef}></svg>
        </button>
    )
}

export default ControlButtonElement