/*
The first byte tells the encoding:
    $00   ISO-8859-1 [ISO-8859-1]. Terminated with $00.
    $01   UTF-16 [UTF-16] encoded Unicode [UNICODE] with BOM. All
        strings in the same frame SHALL have the same byteorder.
        Terminated with $00 00.
    $02   UTF-16BE [UTF-16] encoded Unicode [UNICODE] without BOM.
        Terminated with $00 00.
    $03   UTF-8 [UTF-8] encoded Unicode [UNICODE]. Terminated with $00.
*/

enum FrameIdToField {
    TIT2= "title",
    TPE1= "artist",
    TALB= "album",
    APIC= "picture",
    TCON= 'contentType',
    TYER= 'year',
}

export interface Tags {
    title?: string;
    artist?:string;
    album?: string;
    picture?: Blob;
    contentType?: string;
    year?: string;
}

class AudioMetaDecoder {
    private tags:Tags = {};
    private offset:number = 0;
    private readonly buffer:ArrayBuffer;
    private readonly version:number;

    constructor(buffer:ArrayBuffer) {
        this.buffer = buffer;
        this.version = Number(this.getBytes(1,3));
    }

    isValidFrameId(id:string): id is keyof  typeof FrameIdToField{
        return id in FrameIdToField;
    }

    getPictureDataLength(bytes: Uint8Array, offset: number) {
        let length = 0;
        while (bytes[offset]) {
            offset += 1;
            length += 1;
        }
        return length;
    }

    getPicture(size: number) {
        // Start with 1 to skip description text encoding
        let pictureOffset = 1;
        const bytes = this.getBytes(size);
        const MIMETypeLength = this.getPictureDataLength(bytes, pictureOffset);
        const MIMETypeBytes = this.getBytes( MIMETypeLength,this.offset + pictureOffset);
        const MIMEType = this.decode(MIMETypeBytes);

        // Jump over MIME type, terminator and picture type
        pictureOffset += MIMETypeLength + 2;

        // Skip description and its terminator
        const length = this.getPictureDataLength(bytes, pictureOffset) + 1;
        pictureOffset += length;
        // Description may end in 2 null bytes
        if (bytes[pictureOffset + length + 1] === 0) {
            pictureOffset += 1;
        }
        return new Blob([bytes.slice(pictureOffset)], { type: MIMEType });
    }


    decodeFrame = (size:number, unsynchronisation: number) => {
        const bytes = this.getBytes(size);
        const firstByte = bytes.at(0);
        if (firstByte === 0) {
            if (unsynchronisation > 0) {
                let offset = -1;

                for (let i = 2; i < bytes.length; i += 1) {
                    if (bytes[i - 2] === 255 && bytes[i - 1] === 0 && bytes[i] === 254) {
                        offset = i + 1;
                        break;
                    }
                }

                if (offset > 0) {
                    const stringBytes = bytes.slice(offset).filter(byte => !!byte);
                    return this.decode(stringBytes, "iso-8859-1");
                }
            }
            const string = this.decode(bytes, "iso-8859-1");

            return bytes[bytes.length - 1] === 0 ? string.slice(1, -1) : string.slice(1);
        }

        else if (firstByte === 1) {
            const encoding = bytes[1] === 255 && bytes[2] === 254 ? "utf-16le" : "utf-16be";
            const stringBytes = bytes.length % 2 === 0 ? bytes.slice(3, -1) : bytes.slice(3);

            if (encoding === "utf-16be") {
                stringBytes[0] = 0;
            }
            const string = this.decode(stringBytes, encoding);

            return bytes[bytes.length - 1] === 0 && bytes[bytes.length - 2] === 0 ? string.slice(0, -1) : string;
        }
        else if (firstByte === 2) {
            const stringBytes = bytes.length % 2 === 0 ? bytes.slice(1, -1) : bytes.slice(1);

            return this.decode(stringBytes, "utf-16le");
        }
        else if (firstByte === 3) {
            const string = this.decode(bytes, "utf-8");

            return bytes[bytes.length - 1] === 0 ? string.slice(1, -1) : string.slice(1);
        }
        return this.decode(bytes, "iso-8859-1");
    }

    getMetadata = ():Readonly<Tags> => {
        try {
            // Skip identifier, version, flags
            this.offset+=6
            const tagSize = this.getID3Size() + 10;
            /*
                Frame ID      $xx xx xx xx  (four characters)
                Size      4 * %0xxxxxxx
                Flags         $xx xx
            */
            while (this.offset < tagSize) {
                const id = this.getFrameId();
                const frameSize = this.getFrameSize();
                const frameFlagBytes = this._getBytes(2);
                const usesCompression = this.getBit(frameFlagBytes[1], 3);

                if (id && this.isValidFrameId(id)) {
                    const field = FrameIdToField[id];
                    let size = !usesCompression ?  frameSize : this.getFrameSize();
                    if (field && !this.tags[field]) {
                        if (field === "picture") {
                            this.tags[field] = this.getPicture(size);
                        } else {
                            this.tags[field] = this.decodeFrame(size, this.getBit(frameFlagBytes[1], 1));
                        }
                    }
                }
                this.offset += frameSize;
            }
        } catch (e) {
            console.error(e)
        }
        return this.tags
    }
    private getFrameId() {
        const id = this.decode(this._getBytes(4));
        return /\w{4}/.test(id) ? id : null;
    }
    private getFrameSize () {
        return this.version === 3 ? this.unpackBytes(this._getBytes(4)) : this.getID3Size()
    }
    private getID3Size() {
        return this.unpackBytes(this._getBytes( 4, this.offset), 7);
    }
    private getBit = (value: number, pos: number) => {
        const mask = 1 << pos;
        const result = value & mask;
        return result;
    }
    private _getBytes = (count:number,offset:number = this.offset) => {
        const bytes = new Uint8Array(this.buffer, offset,count);
        this.offset += count;
        return bytes;
    }
    private unpackBytes = (bytes: Uint8Array, shiftBase?:number) => {
        if (shiftBase === 7) {
            return ((((((bytes[0] << 21) | bytes[1])) << 14) | bytes[2]) << 7) | bytes[3];
        }
        return (((bytes[1] << 16) | bytes[2]) << 8) | bytes[3];
    }

    public getBytes = (count:number,offset:number = this.offset) => {
        return new Uint8Array(this.buffer, offset,count);
    }
    public decode = (bytes: Uint8Array, encoding: string = 'utf-8') => {
            const decoder = new TextDecoder(encoding);
            return decoder.decode(bytes);
    }
}

export default AudioMetaDecoder;