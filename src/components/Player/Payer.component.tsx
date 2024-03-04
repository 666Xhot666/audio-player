import React, {useCallback, useEffect, useRef, useState} from "react";
import './Player.css';
import SoundControlComponent, {ControlButtonType} from "../SoundController/SoundControl.component";
import SongTitleComponent from "../SongTitle/SongTitle.component";
import VisualizeComponent, {VisualizeHandle} from "../Visualize/Visualize.component";
import DragAndDropComponent from "../DragAndDrop/DragAndDrop.component";
import SoundDriver from "../../drivers/SoundDriver";
import {Tags} from "../../decoders/AudioMetaDecoder";
import AudioFileInputComponent from "../AudioFileInput/AudioFileInputComponent";

const PayerComponent = () => {
    const [file, setFile] = useState<File|null>(null);
    const [loading, setLoading] = useState(false);
    const soundDriverInstance = useRef<SoundDriver|null>(null);
    const visualizerRef = useRef<VisualizeHandle>(null);
    const songInfo = useRef<Pick<Tags, 'title'|'album'|'artist'|'year'>|null>(null);
    const songBackground = useRef<string|null>();

    useEffect(() => {
        const initializeSoundDriver = () => {
            soundDriverInstance.current = SoundDriver.getInstance();
            if (!file || !soundDriverInstance.current) return;

            soundDriverInstance.current.onplay = () => {
                visualizerRef.current?.play();
            };
            soundDriverInstance.current.onpause = (reset) => {
                visualizerRef.current?.pause(reset);
            };
            soundDriverInstance.current?.load(file).then((audioData) => {
                setLoading(false);
                visualizerRef.current?.setData(audioData);
                if (soundDriverInstance.current) {
                    const {meta} = soundDriverInstance.current
                    if (meta) {
                        const {
                            title,
                            album,
                            artist,
                            year,
                            picture} = meta;
                        songInfo.current = {title, album, artist, year}
                        if (picture) {
                            songBackground.current = URL.createObjectURL(picture);
                        }
                    }
                }

            });
        };
        initializeSoundDriver();
    }, [file]);

    const togglePlayer = useCallback((type:ControlButtonType) => () =>{
        switch (type) {
            case ControlButtonType.Play:
                soundDriverInstance.current?.play();
                return;
            case ControlButtonType.Pause:
                soundDriverInstance.current?.pause();
                return;
            case ControlButtonType.Stop:
                soundDriverInstance.current?.pause(true);
                return;
            case ControlButtonType.Repeat:
                soundDriverInstance.current?.loop();
                return;
            default:
                const _exhaustieCheck:never = type;
                return _exhaustieCheck;
        }
    },[])

    const fileUploadHandler = useCallback((selectedFile:File) => {
        setFile(selectedFile);
        setLoading(true);
    },[])

    const onVolumeChange = useCallback((value:number) => {
        soundDriverInstance.current?.changeVolume(value);
    },[])

    const onPlaybackMove = useCallback((time:number) => {
        soundDriverInstance.current?.moveTo(time);
    },[])

    const getCurrentTime = useCallback( () => {
        return soundDriverInstance.current?.getCurrentTime() ?? 0;
    },[])

    return (
        <DragAndDropComponent onFileUpload={fileUploadHandler} accept="audio" loading={loading}>
            <div className="Player">
                <VisualizeComponent ref={visualizerRef} onPlaybackMove={onPlaybackMove}
                                    getCurrentTime={getCurrentTime}/>
                <SongTitleComponent isLoading={loading} songInfo={songInfo.current}/>
                <SoundControlComponent
                    volumeValue={soundDriverInstance.current?.volume ?? 1}
                    onVolumeChange={onVolumeChange}
                    play={togglePlayer(ControlButtonType.Play)}
                    pause={togglePlayer(ControlButtonType.Pause)}
                    stop={togglePlayer(ControlButtonType.Stop)}
                    repeat={togglePlayer(ControlButtonType.Repeat)}/>
                <AudioFileInputComponent onFileUpload={fileUploadHandler} accept="audio" loading={loading}/>
            </div>
            <div className="PlayerBackground" style={{backgroundImage:`url(${songBackground.current})`}}/>
        </DragAndDropComponent>
    )
}

export default PayerComponent