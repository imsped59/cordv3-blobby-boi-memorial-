// Auto-build and upload CRX
const fs = require('fs-extra');
const archiver = require('archiver');
const { uploadExisting } = require('chrome-webstore-upload');

const store = uploadExisting({
  extensionId: process.env.CRX_STORE_ID,
  clientId: process.env.CRX_CLIENT_ID,
  clientSecret: process.env.CRX_CLIENT_SECRET,
  refreshToken: process.env.CRX_REFRESH_TOKEN
});

(async () => {
  await fs.ensureDir('crx');
  await fs.copy('public', 'crx');
  const zip = fs.createWriteStream('omniblob.crx.zip');
  const archive = archiver('zip');
  archive.pipe(zip);
  archive.directory('crx/', false);
  await archive.finalize();
  await store.uploadExisting('omniblob.crx.zip');
  console.log("OMNIBLOB CRX UPLOADED");
})();