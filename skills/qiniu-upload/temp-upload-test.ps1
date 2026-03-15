
$env:QINIU_ACCESS_KEY = "IUW6AH0KXLM3ny0xawlGgoi7pLa14vXg_vUGmqrh"
$env:QINIU_SECRET_KEY = "LOWZ3kPAw1PMPKjdfUjcGXCWx2ElIPSeQkWhEAaV"
$env:QINIU_BUCKET = "kklldog-images"
$env:QINIU_DOMAIN = "https://static.xbaby.xyz"
npx tsx scripts/upload.ts ..\..\avatars\pixel-dog.svg
