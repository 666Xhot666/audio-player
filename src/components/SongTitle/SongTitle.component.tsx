import React from "react";
import './songTitle.css'
import {Tags} from "../../decoders/AudioMetaDecoder";
type SongTitleProps = {
    songInfo: Partial<Pick<Tags, 'title'|'album'|'artist'|'year'>>|null;
    isLoading: boolean;
}
const SongTitleComponent = ({songInfo, isLoading}:SongTitleProps) => {
    return (
        <div className="songTitle">
            {isLoading ?
                <h2> LOADING ...</h2>:
                <> {songInfo && <>
                    {songInfo?.title && <h2>{songInfo.title}</h2>}
                    { (songInfo?.artist || songInfo?.album || songInfo?.year) ?
                        <h4>
                            {songInfo.album && <> ({songInfo.album}) </>}
                            {songInfo.artist && <> - ({songInfo.artist}) - </>}
                            {songInfo.year && <> ☢︎ {songInfo.year} ☣︎ </>}
                        </h4> :
                        <h2> Noname </h2>
                    }</>}
                </>
            }
        </div>
    )
}

export default SongTitleComponent