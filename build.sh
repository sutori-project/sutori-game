#!/bin/sh

# compile the typescript.
echo "Compiling Scripts"
tsc -p .

# compile the styles.
echo "Compiling Styles"
sass src/styles/main.scss resources/css/main.css --update

# copy dependencies from node_modules.
echo "Copying Dependencies"
cp node_modules/sutori-js/dist/sutori.js resources/js/sutori.js
cp node_modules/sutori-js/dist/sutori.js.map resources/js/sutori.js.map

# begin the app.
echo "Starting App"
neu run