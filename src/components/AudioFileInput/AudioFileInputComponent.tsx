import React, {ChangeEvent, useRef} from "react";
import './audioFileInput.css';

type AudioFileInputProps = {
    loading?: boolean,
    accept?: string,
    onFileUpload?(file:File):void
}
const AudioFileInputComponent = ({loading,accept='audio', onFileUpload}:AudioFileInputProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        if (!fileInputRef.current || loading) return;
        fileInputRef.current.click();
    };

    const handleFileChange = (event:ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const file = event.target.files[0];
        if (!file?.type.includes(accept)) {
            return;
        }
        if (onFileUpload) {
            onFileUpload(file);
        }
    };
    return (
        <>
            <input
                type="file"
                accept="audio/*"
                style={{display: 'none'}}
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <button className={"fileInput"} onClick={handleButtonClick}>
        <span role="img" aria-label="audio-icon">
          🎵
        </span>
                Select Audio
            </button>
        </>
    )
}

export default AudioFileInputComponent;