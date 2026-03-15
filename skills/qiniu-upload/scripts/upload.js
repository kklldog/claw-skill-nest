
const qiniu = require('qiniu');
const fs = require('fs');
const path = require('path');

// Load credentials from environment variables or use provided values
const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const bucket = process.env.QINIU_BUCKET;
const domainFromEnv = process.env.QINIU_DOMAIN; // Optional: custom domain from env

if (!accessKey || !secretKey || !bucket) {
  console.error('Error: QINIU_ACCESS_KEY, QINIU_SECRET_KEY, and QINIU_BUCKET environment variables must be set');
  console.error('You can also set QINIU_DOMAIN for a custom domain');
  process.exit(1);
}

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const options = {
  scope: bucket,
  expires: 3600, // 1 hour
};
const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

const config = new qiniu.conf.Config();
// config.regionsProvider = qiniu.zone.Zone_z0; // Optional: set region if needed
const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

const filePath = process.argv[2];
const key = process.argv[3] || path.basename(filePath);
const domain = process.argv[4] || domainFromEnv; // Use command-line arg first, then env

if (!filePath) {
  console.error('Usage: node upload.js <file-path> [custom-key] [domain]');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error('Error: File not found:', filePath);
  process.exit(1);
}

formUploader.putFile(uploadToken, key, filePath, putExtra, (respErr, respBody, respInfo) => {
  if (respErr) {
    console.error('Upload error:', respErr);
    process.exit(1);
  }
  if (respInfo.statusCode === 200) {
    const publicUrl = domain 
      ? `${domain.replace(/\/$/, '')}/${encodeURIComponent(key)}`
      : `https://${bucket}.qiniudn.com/${encodeURIComponent(key)}`;
    console.log('✅ Upload successful!');
    console.log('Key:', respBody.key);
    console.log('Hash:', respBody.hash);
    console.log('URL:', publicUrl);
  } else {
    console.error('❌ Upload failed: Status code', respInfo.statusCode);
    console.error('Response:', respBody);
    process.exit(1);
  }
});

