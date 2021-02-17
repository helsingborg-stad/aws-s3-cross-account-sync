/* eslint-disable no-console */
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

const S3Target = process.env.S3_BUCKET_TARGET;
exports.handler = async (event) => {
  if (event.Records !== undefined) {
    for (record of event.Records) {
      if (record.s3 !== undefined) {
        const params = {
          Bucket: S3Target,
          CopySource : `/${record.s3.bucket.name}/${record.s3.object.key}`,
          Key: record.s3.object.key,
        };
        try {
          await S3.copyObject(params).promise();
        } catch (ex) {
          console.log(ex);
        }
      }
    };
  }
};
