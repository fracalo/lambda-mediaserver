
exports.filterAreadyInserted = (inDb, urls) =>
  urls.filter(x => !inDb.includes(x))

exports.mergeUrls = (urls, urlsFromDb, urlsFromInsertion) => (
  urls.map(url => {
    // if we have an url in db response that's it
    const fromDb = urlsFromDb && urlsFromDb.find(x => x.urlName === url)
    if (fromDb)
      return fromDb

    // if we have something here we're done
    const fromInsertion = urlsFromInsertion.find(x => x.urlName === url)
    if (fromInsertion)
      return fromInsertion

    // we should never get here but if we do we reconstruct the response
    // passing null as the value for mSUrl
    return {
      urlName: url,
      mSUrl: null
    }
  })
)
