const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function main() {
  try {
    const { stdout: refs } = await exec('git rev-list --tags --max-count=2');
    const [newref, oldref] = refs.split(/\r\n|\r|\n/);

    const { stdout: newtag } = await exec(`git describe --abbrev=0 --tags ${newref}`);
    const { stdout: oldtag } = await exec(`git describe --abbrev=0 --tags ${oldref}`);

    console.log('\x1b[32m%s\x1b[0m', `Latest tag: ${newtag}`);
    console.log('\x1b[32m%s\x1b[0m', `Previous tag: ${oldtag}`);

    console.log(`::set-output name=oldtag::${oldtag}`);
    console.log(`::set-output name=newtag::${newtag}`);
  } catch (error) {
    console.log('\x1b[33m%s\x1b[0m', 'No tags found: ');
    console.log('\x1b[31m%s\x1b[0m', error.stderr);
    process.exit(1);
  }
}

main();
