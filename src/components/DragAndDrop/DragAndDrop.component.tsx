import React, {useRef, useState} from "react";
import './dragAndDrop.css'

type DragAndDropProps = {
    children?: React.ReactNode,
    accept?: string,
    loading?: boolean,
    onFileUpload?(file:File):void
}
const DragAndDropComponent = ({children,accept='audio',onFileUpload, loading}:DragAndDropProps) => {
    const [dragEnter,setDragEnter] = useState(false)
    const dragEnterHandler = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (loading) return;
        setDragEnter(true);
    }

    const  dragLeaveHandler = (event:React.DragEvent<HTMLDivElement>) => {


        // setDragEnter(false)
    }

    const dropHandler = (event:React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files.item(0)
        setDragEnter(false);
        if (!file?.type.includes(accept)) {
            return;
        }
        if (onFileUpload) {
            onFileUpload(file);
        }
    }

    return (
        <div className="dragAndDrop"
             // onDragEnter={dragEnterHandler}
             onDragOver={dragEnterHandler}
             onDragLeave={dragLeaveHandler}
             onDrop={dropHandler}
        >
            {dragEnter && <div
                className="dragAndDropArea"
            >
                <div className="dropAria">
                    <h2>Drag and Drop Files Here </h2>
                    ♻️
                </div>

            </div>}
            {children}

        </div>
    )

}
export default DragAndDropComponent