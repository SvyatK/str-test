import { Injectable } from '@nestjs/common';
const spawn = require('child_process').spawn;
const BlinkDiff = require('blink-diff');
const PNGImage = require('pngjs-image');

@Injectable()
export class AppService {
  root(): string {
    for (let i = 1; i < 10; i++){
      const prefix1 = i < 100 ? ((i < 10) ? 'frames2/out-00' : 'frames2/out-0') : 'frames2/out-';
      const prefix2 = i < 99 ? ((i < 9) ? 'frames2/out-00' : 'frames2/out-0') : 'frames2/out-';
      const prefix3 = i < 99 ? ((i < 9) ? 'frames-out2/out-00' : 'frames-out2/out-0') : 'frames-out2/out-';

      const firstImage = PNGImage.readImage(prefix1 + i + '.png', (err) => {

        if (err) {
          throw err;
        }

        const diff = new BlinkDiff({
          imageA: firstImage, // Use already loaded image for first image
          imageBPath: prefix2 + (i + 1) + '.png', // Use file-path to select image

          outputMaskRed: 0,
          outputMaskBlue: 0, // Use blue for highlighting differences
          outputMaskOpacity: 0,
          outputShiftOpacity: 0,
          outputBackgroundOpacity: 1,
          composition: false,

          imageOutputPath: prefix3 + (i + 1) + 'diff.png',
        });

        diff.run((error, result) => {
          if (error) {
            throw error;
          } else {
            console.log(diff.hasPassed(result.code) ? 'Passed' : 'Failed');
            console.log('Found ' + result.differences + ' differences.');
          }
        });
      });
    }
    return 'Hello World!';
  }

  test1(): void {
/*    const d1 = new Date();
    const n1 = d1.getTime();
    for (let i = 1; i < 3850; i++){
      const prefix1 = i < 100 ? ((i < 10) ? 'frames/out-00' : 'frames/out-0') : 'frames/out-';
      const prefix2 = i < 99 ? ((i < 9) ? 'frames/out-00' : 'frames/out-0') : 'frames/out-';
      let filesRead = 0;
      const img1 = fs.createReadStream(prefix1 + i + '.png').pipe(new PNG()).on('parsed', doneReading);
      const img2 = fs.createReadStream(prefix2 + (i + 1) + '.png').pipe(new PNG()).on('parsed', doneReading);

      function doneReading() {
        if (++filesRead < 2) return;
        const diff = new PNG({width: img1.width, height: img1.height});

        pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {threshold: 0.1});

        diff.pack().pipe(fs.createWriteStream(prefix2 + (i + 1) + 'diff.png'));

        const d2 = new Date();
        const n2 = d2.getTime();
        console.log('time', i, n2 - n1);
      }
    }*/
  }
  createFrames(): void {
    let fileName = 'jellyfish-25-mbps-hd-hevc.mp4';

    let ffmpeg = spawn('ffmpeg', ['-i', `${ fileName }`, `frames2/out-%03d.png`]);
    ffmpeg.on('exit', (statusCode) => {
      if (statusCode === 0) {
        console.log('conversion successful');
      }
    })

    ffmpeg
      .stderr
      .on('data', (err) => {
        console.log('err:', new String(err));
      })
  }
}
