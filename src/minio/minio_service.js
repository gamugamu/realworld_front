var Minio = require('minio')

console.log('*** minio service')

// file
var minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  secure: false,
  accessKey: 'AKIAIOSFODNN7EXAMPLE', // domaine restriction par nginx
  secretKey: 'SECRETSECRET'
})

console.log('*** minio service', minioClient)

// Make a bucket called europetrip.
minioClient.makeBucket('blogimage', 'eu-west-3', function (err) {
  console.log('will make bucket')

  if (err) {
    return console.log('error', err)
  }
  console.log('Bucket created successfully in "us-east-1".')
})
