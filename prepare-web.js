// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const rimraf = require('rimraf');

rimraf('./ui/src/routes.d.ts', () => console.log('DELETED - ./ui/src/routes.d.ts'));
rimraf('./ui/src/routes.d.ts.map', () => console.log('DELETED - /ui/src/routes.d.ts.map'));
rimraf('./ui/src/routes.js', () => console.log('DELETED - ./ui/src/routes.js'));
rimraf('./ui/src/routes.js.map', () => console.log('DELETED - ./ui/src/routes.js.map'));
