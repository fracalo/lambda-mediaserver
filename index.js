
const { filterAreadyInserted, mergeUrls } = require('./utils')
const { checkKeys, insertions } = require('./dbMethods')
const uploadImagesToS3 = require('./uploadImagesToS3')


exports.handler = async (event) => {
  const body = JSON.parse(event.body)
  const { urls } = body

  const urlsIsArray = Array.isArray(urls)
  // throw if urls is not and array with something in it
  if (!urlsIsArray && !!urls.length) {
    return {
      statusCode: 200,
      body: JSON.stringify('urls parameter needs to be a non empty array')
    }
  }


  const dbCheck = await checkKeys(urls)

  const urlsInDb = dbCheck.Responses.YourTableNameHere.map(x => x.urlName)

  // we filter the ones that are missing
  const missingUrls = filterAreadyInserted(urlsInDb, urls)

  // we upload missing urls to S3
  const uploads = await uploadImagesToS3(missingUrls)

  // insertions of missing urls in db
  const urlInsertionInDb = await insertions(uploads)

  // we reconcile the urls
  const mergedUrls = mergeUrls(urls, urlsInDb, urlInsertionInDb)

  const response = {
    statusCode: 200,
    body: JSON.stringify(mergedUrls)
  }
  return response
}
