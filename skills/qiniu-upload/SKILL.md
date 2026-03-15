
---
name: qiniu-upload
description: Upload images/files to Qiniu Cloud (七牛云) and get the public URL. Use when you need to upload a local file or image to Qiniu Cloud object storage and retrieve the accessible URL. Requires Qiniu Access Key, Secret Key, Bucket name, and domain (optional).
---

# Qiniu Cloud Upload Skill

This skill helps you upload files to Qiniu Cloud (七牛云) object storage and get the public URL.

## Prerequisites
- Qiniu Cloud account (register at https://portal.qiniu.com/signup)
- Access Key and Secret Key (get from https://portal.qiniu.com/user/key)
- Bucket name (create in Qiniu Cloud console)
- (Optional) Custom domain bound to the bucket (uses default domain if not provided)

## Setup
1. Install Qiniu Node.js SDK:
   ```bash
   npm install qiniu
   ```
2. Save your Qiniu credentials in TOOLS.md (or a secure location):
   ```markdown
   ### Qiniu Cloud
   - Access Key: YOUR_ACCESS_KEY
   - Secret Key: YOUR_SECRET_KEY
   - Bucket: YOUR_BUCKET_NAME
   - Domain: https://your-custom-domain.com (optional, uses default if not set)
   ```

## Usage
Use the `scripts/upload.ts` (TypeScript) or `scripts/upload.js` (JavaScript) script to upload a file:

### TypeScript (recommended, cross-platform):
```bash
npx tsx scripts/upload.ts <file-path> [custom-key] [domain]
```

### JavaScript:
```bash
node scripts/upload.js <file-path> [custom-key] [domain]
```
- `<file-path>`: Path to the file to upload (required)
- `[custom-key]`: Custom key (filename) in Qiniu Cloud (optional, uses original filename if not provided)
- `[domain]`: Custom domain for the final URL (optional, uses default `https://<bucket>.qiniudn.com` if not provided)

## Scripts
### scripts/upload.js
Node.js script to upload files to Qiniu Cloud. Uses `qiniu` SDK.

**Example**:
```javascript
// scripts/upload.js
const qiniu = require('qiniu');
const fs = require('fs');
const path = require('path');

// Load credentials from TOOLS.md or environment variables
// For simplicity, you can hardcode here or use env vars
const accessKey = process.env.QINIU_ACCESS_KEY || 'YOUR_ACCESS_KEY';
const secretKey = process.env.QINIU_SECRET_KEY || 'YOUR_SECRET_KEY';
const bucket = process.env.QINIU_BUCKET || 'YOUR_BUCKET_NAME';
const domain = process.env.QINIU_DOMAIN || null; // Use default domain if null

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const options = {
  scope: bucket,
  expires: 3600, // 1 hour
};
const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

const config = new qiniu.conf.Config();
// config.zone = qiniu.zone.Zone_z0; // Optional: set zone if needed
const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

const filePath = process.argv[2];
const key = process.argv[3] || path.basename(filePath);

if (!filePath || !fs.existsSync(filePath)) {
  console.error('Error: File not found');
  process.exit(1);
}

formUploader.putFile(uploadToken, key, filePath, putExtra, (respErr, respBody, respInfo) => {
  if (respErr) {
    console.error('Upload error:', respErr);
    process.exit(1);
  }
  if (respInfo.statusCode === 200) {
    const publicUrl = domain ? `${domain}/${encodeURIComponent(key)}` : `https://${bucket}.qiniudn.com/${encodeURIComponent(key)}`;
    console.log('Upload successful!');
    console.log('Key:', respBody.key);
    console.log('Hash:', respBody.hash);
    console.log('URL:', publicUrl);
  } else {
    console.error('Upload failed:', respInfo.statusCode, respBody);
    process.exit(1);
  }
});
```

## References
- Qiniu Node.js SDK docs: https://developer.qiniu.com/kodo/1289/nodejs
- Qiniu SDK GitHub: https://github.com/qiniu/nodejs-sdk
