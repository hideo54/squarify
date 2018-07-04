const sharp = require('sharp');

const getSize = file => {
    return new Promise((resolve, reject) => {
        sharp(file).metadata().then(data => {
             resolve({ width: data.width, height: data.height })
         });
    });
};

const main = async file => {
    const size = await getSize(file);
    const max = Math.max(size.width, size.height);
    let extendedLength;
    const diff = Math.abs(size.width - size.height);
    const former = Math.floor(diff/2);
    const latter = diff - former;
    if (size.width > size.height) {
        extendedLength = {top: former, bottom: latter, left: 0, right: 0};
    } else {
        extendedLength = {top: 0, bottom: 0, left: former, right: latter};
    }
    console.log(extendedLength);
    sharp(file).background( { r: 0, g: 0, b: 0, alpha: 0 } )
        .extend(extendedLength)
        .png()
        .toFile('output.png');
};

main('sample.jpg');
