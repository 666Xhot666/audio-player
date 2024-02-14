import React, {
    forwardRef, useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import * as d3 from "d3";

import WaveGraph from "./WaveGraph.element";
import BandAxisElement from "./BandAxis.element";
import PlaybackElement, {PlaybackHandle} from "./Playback.element";
import './visualize.css'


export type VisualizeHandle = {
    setData(audioData:AudioBuffer):void;
    play():void;
    pause(reset:boolean):void;
}
type VisualizeProps = {
    onPlaybackMove:(time:number)=>void;
    getCurrentTime:()=>number;
}

const VisualizeComponent = forwardRef<VisualizeHandle,VisualizeProps>(({onPlaybackMove,getCurrentTime},ref) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const playbackRef = useRef<PlaybackHandle>(null)
    const [audioData, setAudioData] = useState<Array<number>>([]);
    const [duration,setDuration] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const draggable = useRef(false);

    useImperativeHandle(ref,()=> {
        return {
            setData: (audioData:AudioBuffer) => {
                const rawData = audioData.getChannelData(0);
                const samples = audioData.sampleRate/5;
                const blockSize = Math.floor(rawData.length/samples);
                const filteredData = Array.from({length:samples}, (_,index)=> {
                    const blockStart = blockSize*index;
                    let sum = 0;
                    for (let i = 0; i<blockSize; i++){
                        sum += Math.abs(rawData[blockStart+i]);
                    }
                    return sum/blockSize
                })
                    const multiplier = Math.max(...filteredData);
                    setAudioData(filteredData.map(n=>n*multiplier));
                    setDuration(audioData.duration);
            },
            play: () => {
                setIsPlaying(true);
            },
            pause: (reset:boolean=false) => {
                if (reset) playbackRef.current?.setProgress(0);
                setIsPlaying(false)
            }
        }
    })
    useLayoutEffect(()=>{
        if (!svgRef.current || !svgRef.current.parentElement || !audioData.length) return;
        svgRef.current.parentElement.style.opacity = '1';
    },[audioData])
    useEffect(() => {
        if (!svgRef.current) return;
        d3.select(svgRef.current)
            .on('mousedown', (event:React.MouseEvent<SVGRectElement>) =>{
                if (!svgRef.current) return;
                const width = svgRef.current.clientWidth;
                const [positionX] = d3.pointer(event);
                const currentTime = duration*positionX/width;
                playbackRef.current?.setProgress(currentTime/duration*100);
                onPlaybackMove(currentTime);
                draggable.current = true;
            })
            .on('mouseup', (event:React.MouseEvent<SVGRectElement>) =>{draggable.current = false})
            .on('mouseleave', (event:React.MouseEvent<SVGRectElement>) =>{draggable.current = false})
            .on('mousemove', (event:React.MouseEvent<SVGRectElement>) =>{
                if (!draggable.current || !svgRef.current) return;
                const width = svgRef.current.clientWidth;
                const [positionX] = d3.pointer(event);
                const currentTime = duration*positionX/width;
                onPlaybackMove(currentTime);
                playbackRef.current?.setProgress(currentTime/duration*100)
            })

    }, [audioData,duration,onPlaybackMove]);

    useLayoutEffect(() => {
        let previousTimeStamp=0;
        let step:null| { (t: number):void };
         step = (timeStamp:number) => {
            if (timeStamp-previousTimeStamp >= 100 && !draggable.current) {
                previousTimeStamp = timeStamp;
                playbackRef.current?.setProgress(getCurrentTime()/duration*100)
            }
            if (isPlaying && step) requestAnimationFrame(step);
        }
        if (isPlaying) requestAnimationFrame(step);
        return () =>{step = null}
    }, [isPlaying,duration,getCurrentTime]);

    return (
        <div className="visualizer_container">
                <div className='visualizer' draggable={false} unselectable={"on"}>
                    <svg className="graph" width="100%" height="100%" ref={svgRef}>
                        {!!audioData.length &&
                            <>
                                <WaveGraph audioData={audioData}/>
                                <BandAxisElement duration={duration}/>
                                <PlaybackElement ref={playbackRef}/>
                            </>
                        }
                    </svg>
                </div>
        </div>
    )
})

export default VisualizeComponent