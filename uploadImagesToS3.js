
const s3 = new AWS.S3()
const uniqid = require('uniqid')
const fetch = require('node-fetch')
const crypto = require('crypto')

const uploadImagesToS3 = async list =>
  Promise.all(list.map(processSingleImage))


const processSingleImage = orgUrl => {
  const Bucket = 'YourBucketName'
  const ext = orgUrl.split('.').pop().toLowerCase()
  // we use uniq to create the filename
  const uid = uniqid()
  // storing the files in r/ directory inside S3
  const fileName = `${uid}.${ext}`
  const Key = `r/${fileName}`

  // getting the content of the media
  const blob = fetch(orgUrl)
    .then(x => x.buffer())

  // writing to S3
  const putOperation = blob.then(data => {
    const params = {
      Bucket,
      Key,
      Body: data,
      CacheControl: 'max-age=31536000'
    }
    return s3.putObject(params).promise()
  })

  return Promise.all([blob, putOperation])
    .then(([b, x]) => {
      // if ETag is present it means the image as been written properly
      if (!!x.ETag) {
        const ETag = JSON.parse(x.ETag)

        // we eventually check(not implemented here) that the ETag given back is s3
        // is equal to the one calculated in the lambda (it should)
        const md5hash = crypto.createHash('md5').update(b).digest('hex')

        return {
          status: 'OK',
          mSUrl: `https://s3.eu-west-3.amazonaws.com/${Bucket}/${Key}`,
          urlName: orgUrl,
          s3Payload: x,
          md5hash,
          md5SumRes: ETag === md5hash,
          insertedAt: Date.now()
        }
      }

      // this is our error case
      return {
        status: 'KO',
        orgUrl,
        payload: x
      }
    })
    // we set status to 'KO' if md5SumRes is false
    .then(x => {
      if (x.status === 'OK' && !x.md5SumRes)
        x.status = 'KO'

      return x
    })
}

module.exports = uploadImagesToS3
