const fs = require('fs');
const { execSync } = require('child_process');

const filesToRun = [
'kotak.js',
'reliance.js',
'tataaig.js',
'icici.js',
'oriantal.js',
'liberty.js',
'godigit.js',
'carehealth.js',
'fhpl.js',
'magma.js',
'vidal.js',
  // Add more file names as needed
];

filesToRun.forEach((file) => {
  console.log(`Running ${file}...`);
  try {
    execSync(`node ${file}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error running ${file}:`, error.message);
  }
});