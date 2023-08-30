const Messages= require("../db/Model/dataSchema");

const { createDecipheriv, createHmac, timingSafeEqual } = require("crypto");

// validating sha-256 Hmac using secret_key and hash_secret
const validateHmac = (secret_key, data) => {
  const stringData = JSON.stringify(data);
  const secret = process.env.SHA256_SECRET_KEY;

  const sha256Hash = createHmac("SHA256", secret)
    .update(stringData, "utf-8")
    .digest("base64");

  const providedHmac = Buffer.from(secret_key, "utf-8");
  const generatedHash = Buffer.from(sha256Hash, "utf-8");

  if (!timingSafeEqual(generatedHash, providedHmac)) {
    throw new Error("Invalid secret key");
  }
};

// decrypting the data using decryption algorithm `aes-256-ctr` with a pass key
const decryptAndValidateData = async (messageDataArr, time) => {
  const decryptMessageData = [];
  const HMACFailedCount = 0;

  const iv = process.env.INITIALIZATION_VECTOR_SECRET_KEY; ;
  const key = process.env.ENCRYPT_DECRYPT_SECRET_KEY;

  try {
    messageDataArr.forEach((element) => {
      const decrypterIv = createDecipheriv("aes-256-ctr", key, iv);
      let decryptedMessage = decrypterIv.update(element, "hex", "utf8");
      decryptedMessage += decrypterIv.final("utf8");

      const { secret_key, ...actualMessage } = JSON.parse(decryptedMessage);

      try {
        validateHmac(secret_key, actualMessage);

        actualMessage["time_stamp"] = time;

        decryptMessageData.push(actualMessage);
      } catch (error) {
        HMACFailedCount += 1;
      }
    });
    const failureRate = (HMACFailedCount / messageDataArr.length) * 100;

    return { decryptMessageData, failureRate };
  } catch (err) {
    console.error(err);
  }
};

// Get rounded time wiht interval of 1 minute
const getRoundedDate = (date = new Date()) => {
  return new Date(
    date.getTime() - date.getSeconds() * 1000 - date.getMilliseconds()
  );
};

// get index with interval of 10 second
const getSegmentIndex = (date = new Date()) => {
  return parseInt(date.getSeconds() / 10);
};

// add time stamp & insert data to mongodb
const insertData = async (data, time) => {
  const minuteDate = getRoundedDate(time);
  const segmentIndex = getSegmentIndex(time);

  try {
    const findRes = await Messages.find({ time_stamp: minuteDate });
    if (findRes.length === 0) {
      const message = new Messages({
        time_stamp: minuteDate,
        segments: { [segmentIndex]: data },
      });

      const insertRes = await message.save();
      return insertRes;
    } else {
      const updateRes = await Messages.findByIdAndUpdate(
        { _id: findRes[0]._id },
        {
          time_stamp: findRes[0].time_stamp,
          segments: {
            ...findRes[0].segments,
            [segmentIndex]: data,
          },
        },
        {
          new: true,
        }
      );
      return updateRes;
    }
  } catch (err) {
    throw err;
  }
};

module.exports = { insertData, decryptAndValidateData };
