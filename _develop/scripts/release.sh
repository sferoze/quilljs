#!/bin/bash

rm -r release
rm -r dist
mkdir release
mkdir release/quill

npm run build
webpack --config _develop/webpack.config.js --env.minimize
cp dist/quill.core.css dist/quill.bubble.css dist/quill.snow.css dist/quill.js dist/quill.core.js dist/quill.min.js dist/quill.min.js.map .release/quill/

