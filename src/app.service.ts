import {Injectable} from '@nestjs/common';
import * as fs from 'fs';
import {PNG} from 'pngjs';
import {exec} from 'child_process';

var xorInplace = require('buffer-xor/inplace');
var xor = require('buffer-xor/index');

const spawn = require('child_process').spawn;
const BlinkDiff = require('blink-diff');
const PNGImage = require('pngjs-image');

@Injectable()
export class AppService {

    constructor() {
        this.root()
            .then();
    }

    async root(): Promise<string> {
        const start = Date.now();
        console.log(`Starting`);
        await this.createFrames();
        let currentKeyframe: Buffer;
        let changedPixelsCount: number = 0;
        let framesCount: number = 0;
        for (let i = 1; i <= 3800; i++) {
            const prefix1 = i < 100 ? ((i < 10) ? '/tmp/temp-transcoding/frames2/out-00' : '/tmp/temp-transcoding/frames2/out-0') : '/tmp/temp-transcoding/frames2/out-';
            const prefix2 = i < 99 ? ((i < 9) ? '/tmp/temp-transcoding/frames2/out-00' : '/tmp/temp-transcoding/frames2/out-0') : '/tmp/temp-transcoding/frames2/out-';
            const prefix3 = i < 99 ? ((i < 9) ? '/tmp/temp-transcoding/frames-out2/out-00' : '/tmp/temp-transcoding/frames-out2/out-0') : '/tmp/temp-transcoding/frames-out2/out-';
            if (!currentKeyframe) {
                currentKeyframe = fs.readFileSync(`${prefix1}${i}.bmp`);
            }
            for (let j = 0; j <= 100; j++) {
                currentKeyframe.writeInt8(0, j);
            }
            const buffer2 = fs.readFileSync(`${prefix2}${i + 1}.bmp`);
            const outBuffer = Buffer.alloc(buffer2.length);
            outBuffer.writeInt8(buffer2.readInt8(0), 0);
            for (let j = 0; j <= buffer2.length / 3 - 2; j++) {
                const color1 = currentKeyframe.readUIntBE(j * 3 + 1, 3);
                const color2 = buffer2.readUIntBE(j * 3 + 1, 3);
                if (color1 === color2) {
                    outBuffer.writeUIntBE(0, j * 3 + 1, 3);
                } else {
                    const diffR = currentKeyframe.readUInt8(j * 3 + 1) - buffer2.readUInt8(j * 3 + 1);
                    const diffG = currentKeyframe.readUInt8(j * 3 + 2) - buffer2.readUInt8(j * 3 + 2);
                    const diffB = currentKeyframe.readUInt8(j * 3 + 3) - buffer2.readUInt8(j * 3 + 3);
                    if (j > 100 && Math.abs(diffR * diffG * diffB) < 500) {
                        outBuffer.writeUIntBE(0, j * 3 + 1, 3);
                    } else {
                        outBuffer.writeUIntBE(color2, j * 3 + 1, 3);
                        changedPixelsCount++;
                    }
                }
            }
            // const outPngBuffer = PNG.sync.write(PNG.sync.(outBuffer));
            fs.writeFileSync(`${prefix3}${i + 1}diff.bmp`, outBuffer);
            currentKeyframe = buffer2;
            framesCount++;
        }
        console.log(`Time spent on BMP-s: ${Date.now() - start}ms`);
        // without multi-processing
        // let mogrify = spawn('mogrify', ['-format', 'png', '/tmp/temp-transcoding/frames-out2/*.bmp']);
        // with multi-processing (16)
        let mogrify = exec('find /tmp/temp-transcoding/frames-out2/*.bmp -type f | parallel -j 8  mogrify -format png -define png:compression-level=9 -define png:compression-filter=5 -define png:compression-strategy=2 -transparent black {}');
        mogrify.on('exit', (statusCode) => {
            if (statusCode === 0) {
                console.log(`Time spent: ${Date.now() - start}ms. Average changed pixels per frame: ${(changedPixelsCount / framesCount).toFixed(2)}`);
            }
        });
        return 'Hello World!';
    }

    async createFrames(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            console.log('Create frames');
            let fileName = 'DLP_PART_2_768k.mp4';

            let ffmpeg = spawn('ffmpeg', ['-i', `${ fileName }`, `/tmp/temp-transcoding/frames2/out-%03d.bmp`]);
            ffmpeg.on('exit', (statusCode) => {
                if (statusCode === 0) {
                    resolve();
                }
            });

            ffmpeg
                .stderr
                .on('data', (err) => {
                    console.log('err:', new String(err));
                });
        });
  }
}
