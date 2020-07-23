const fs = require('fs').promises;
const { join } = require('path');
const xml2js = require('xml2js');

const { VERSION } = process.env;

const now = new Date();
const DATE = now.toISOString().split('T')[0];

async function main(version, date) {
  const parser = new xml2js.Parser();
  const builder = new xml2js.Builder({ xmldec: { version: '1.0', encoding: 'UTF-8' } });

  const appdataPath = join(__dirname, '..', 'co.headsetapp.headset.metainfo.xml');

  const appdataXml = await fs.readFile(appdataPath, { encoding: 'utf8' });
  const appdata = await parser.parseStringPromise(appdataXml);

  appdata.component.releases[0].release.unshift({ $: { version, date } });

  const newAppdataXml = builder.buildObject(appdata);
  await fs.writeFile(appdataPath, `${newAppdataXml}\n`, { encoding: 'utf8' });
}

main(VERSION, DATE);
