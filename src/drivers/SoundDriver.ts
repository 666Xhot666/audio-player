import AudioMetaDecoder, {Tags} from "../decoders/AudioMetaDecoder";

class SoundDriver {
    private static _instance: SoundDriver|null = null;

    private audioBuffer:AudioBuffer|null = null;
    private gainNode:GainNode|null = null;
    private bufferSource:AudioBufferSourceNode|null = null;
    private context: AudioContext;

    private offset:number = 0;
    private pausedAt:number = 0;
    private startedAt:number = 0;
    
    meta: Readonly<Tags>|null = null;

    isLoop:boolean = false;
    isRunning:boolean = false;
    volume:number = 1;

    onplay?:() => void;
    onpause?:(reset:boolean) => void;
    private constructor() {
            this.context = new AudioContext();
    }

    public static getInstance = () => {
        return SoundDriver._instance ??= new SoundDriver()
    }

    public load = (audioFile:File) => {
        return new Promise<AudioBuffer>((resolve,reject) => {
            audioFile.arrayBuffer()
                .then(this.clean)
                .then(this.decodeMetadata)
                .then(buffer => this.context.decodeAudioData(buffer))
                .then(buffer => {
                    this.audioBuffer = buffer;
                })
                .then(()=>{
                    if (!this.audioBuffer) throw new Error('Audio File decoding error');
                    resolve(this.audioBuffer);
                })
                .catch(reject)
        })
    }
    private decodeAudio = (event: ProgressEvent<FileReader>) => {
        if (!event?.target?.result) {
            throw new Error('Cannot read the file');
        }
        return this.context.decodeAudioData(event.target.result as ArrayBuffer)
    }



    private decodeMetadata = (buffer:ArrayBuffer) => {
        const decoder = new AudioMetaDecoder(buffer);
        if (!/ID3/.test(decoder.decode(decoder.getBytes(8, 0)))) {
            console.warn('Unsupported  audio file format, no meta provided');
            return buffer;
        }
        this.meta = decoder.getMetadata();
        return buffer;
    }
    private clean = (buffer:ArrayBuffer)=> {
        return new Promise<ArrayBuffer>((resolve,reject) => {
            this.pausedAt = 0;
            this.startedAt = 0;
            this.offset = 0;
            this.isRunning = false;
            this.bufferSource?.disconnect();
            this.gainNode?.disconnect();
            this.audioBuffer = null;
            if (this.onpause) this.onpause(true);
            this.context.close()
                .then(()=>{
                    this.context = new AudioContext()
                    resolve(buffer)
                })
                .catch(reject)
        })
    }
    public play = async () => {
        if (!this.audioBuffer || this.isRunning) return;
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = this.volume;
        this.bufferSource = this.context.createBufferSource();
        this.bufferSource.buffer = this.audioBuffer;
        this.bufferSource.onended = async () => {
            if (!this.audioBuffer || this.getCurrentTime() !== this.audioBuffer.duration) return;
            await this.pause(true);
            if (!this.isLoop) return;
            await this.play();
        };
        this.bufferSource.connect(this.gainNode);
        this.bufferSource.connect(this.context.destination);
        this.gainNode.connect(this.context.destination);


        await this.context.resume();
        if (!this.startedAt && !this.offset && !this.pausedAt) {
            this.startedAt = this.context.currentTime;
        }
        this.bufferSource.start(0,this.pausedAt+this.offset)
        this.isRunning = true;
        if (this.onplay) this.onplay();
    }

    public pause = async(reset=false) => {
        if (!this.audioBuffer || !this.gainNode || !this.bufferSource) return;

        await this.context.suspend();

        if (reset) {
            this.startedAt = this.context.currentTime;
            this.offset = 0;
        }
        this.pausedAt = this.context.currentTime - this.startedAt;

        this.bufferSource.stop();
        this.bufferSource.disconnect();
        this.gainNode.disconnect();
        this.isRunning = false;
        if (this.onpause) this.onpause(reset);
    }

    public loop = () => {
        this.isLoop = !this.isLoop
    }

    public moveTo =(time:number) => {
        if (time>0 && this.audioBuffer){
            this.offset = Math.min(this.audioBuffer.duration,time)-this.context.currentTime+this.startedAt;
        }
        if (!this.isRunning) return;
        return this.pause().then(this.play)
    }
    public changeVolume(volume:number) {
        this.volume = volume
        if (this.gainNode){
            this.gainNode.gain.value = this.volume
        }
    }

    public getCurrentTime = () => {
        const currentTime = this.context.currentTime - this.startedAt + this.offset
        const duration = this.audioBuffer?.duration ?? 0
        return currentTime > 0? currentTime<duration?currentTime:duration:0;
    }

}

export default SoundDriver