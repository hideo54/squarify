const Koa = require('koa');
const app = new Koa();
const multer = require('koa-multer');
const fs = require('fs');
const pug = require('pug');

const sharp = require('sharp');
const getSize = file => {
    return new Promise((resolve, reject) => {
        sharp(file).metadata().then(data => {
             resolve({ width: data.width, height: data.height })
         });
    });
};
const returnPNG = async (file, size) => {
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
    await sharp(file).background( { r: 0, g: 0, b: 0, alpha: 0 } )
        .extend(extendedLength)
        .png()
        .toFile('output.png');
};


app.use(route.post('/download', multer().single('file')));
app.use(async (ctx, next) => {
    if (ctx.path === '/') {
        ctx.status = 200;
        ctx.body = pug.renderFile('index.pug');
    } else if (ctx.path === '/download') {
        if (ctx.method === 'GET') {
            ctx.status = 303;
            ctx.body = '<head><meta http-equiv="refresh" content="0; URL=/" /></head>';
        }
        if (ctx.method === 'POST') {
            const buf = ctx.req.file.buffer;
            const size = await getSize(buf);
            await returnPNG(buf, size);
            ctx.status = 200;
            ctx.body = pug.renderFile('download.pug');
        }
    } else if (ctx.path === '/output') {
        ctx.status = 200;
        ctx.type = 'image/png';
        ctx.body = fs.createReadStream('output.png');
    } else {
        ctx.status = 500;
    }
});

app.listen(3000);
