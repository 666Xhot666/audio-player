import React from "react";
import './SoundControl.css'
import ControlButtonElement from "../../elements/ControlButton/controlButton.element";
import VolumeInputElement from "../../elements/VolumeInput/VolumeInput.element";
type SoundControlProps = {
    volumeValue:number;
    onVolumeChange?(value:number):void;
    play?:()=>void;
    pause?:()=>void;
    stop?:()=>void;
    repeat?:()=>void;
}

export enum ControlButtonType {
    Play='play',
    Pause='pause',
    Stop='stop',
    Repeat='repeat',
}
const SoundControlComponent = ({volumeValue,onVolumeChange,play,pause,stop,repeat}:SoundControlProps) => {

    return (
        <div className="soundControl"
        >

            <div className="controlButtons"
            >
                <ControlButtonElement controlButtonType={'Play'} onClick={play}/>
                <ControlButtonElement controlButtonType={'Pause'} onClick={pause}/>
                <ControlButtonElement controlButtonType={'Stop'} onClick={stop}/>
                <ControlButtonElement controlButtonType={'Repeat'} onClick={repeat}/>
            </div>
            <VolumeInputElement onChange={onVolumeChange} defaultValue={volumeValue}/>
        </div>
    )
}

export default SoundControlComponent