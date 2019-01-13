
const AWS = require('aws-sdk')
AWS.config.update({
  region: 'eu-west-3'
})

const client = new AWS.DynamoDB.DocumentClient()


exports.checkKeys = async hashes => {
  const params = {
    RequestItems: {
      YourTableNameHere: {
        Keys: hashes.map(x => ({ urlName: x }))
      }
    }
  }

  let data = ''
  try {
    data = await client.batchGet(params).promise()
  }
  catch (e) {
    data = e
  }
  return data
}


exports.insertions = async arr => {
  const promArr = arr.map(async (x) => {
    const params = {
      TableName: 'YourTableNameHere',
      Item: x
    }

    try {
      let data = await client.put(params).promise()
    }
    catch (e) {
      throw new Error('from insertions in DynamoDB: ', e)
    }
    return x
  })
  // we return a single promise that contains an array
  return Promise.all(promArr)
}
