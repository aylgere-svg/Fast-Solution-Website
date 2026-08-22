import fs from 'fs';

const graphServiceFile = 'src/services/graphService.ts';
let graphCode = fs.readFileSync(graphServiceFile, 'utf8');

graphCode = graphCode.replace(
  /throw new Error\('Graph API error fetching items: ' \+ JSON\.stringify\(errData\)\);/g,
  "throw new Error('Graph API error fetching items (URL: ' + graphUrl + '): ' + JSON.stringify(errData));"
);
fs.writeFileSync(graphServiceFile, graphCode);

const sharepointServiceFile = 'src/services/sharepointService.ts';
let spCode = fs.readFileSync(sharepointServiceFile, 'utf8');

spCode = spCode.replace(
  /throw new Error\(`Graph API request failed: \$\{response\.status\}\`\);/g,
  "throw new Error(`Graph API request failed (URL: ${url}): ${response.status} - ` + (errorData ? JSON.stringify(errorData) : ''));"
);
fs.writeFileSync(sharepointServiceFile, spCode);
console.log('patched');
