const Jimp = require('jimp');
const { app } = require('electron');
const path = require('path');

/**
 * Retrieves the video thumbnail, crops it to a square and safes it to disk.
 * It uses 'default.jpg' which is usually the smallest size/resolution.
 *
 * @param   {string}  videoID  The video ID used to retrieve the thumbnail.
 *
 * @return  {string}           The file URI of the cropped thumbnail on disk, or the original thumbnail URL.
 */
async function mprisCover(videoID) {
  const url = `https://i.ytimg.com/vi/${videoID}/default.jpg`;
  try {
    const image = await Jimp.read(url);
    image.cover(image.bitmap.height, image.bitmap.height, Jimp.HORIZONTAL_ALIGN_CENTER);

    const uri = path.join(app.getPath('userData'), 'cover.jpg');
    await image.writeAsync(uri);
    return `file://${uri}`;
  } catch (error) {
    return url;
  }
}

module.exports = mprisCover;
