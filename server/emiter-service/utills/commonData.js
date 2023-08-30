const data = require("../data.json");
const { createHmac, createCipheriv } = require("crypto");

// creating sha-256 ash of originalMessage
const getSha256Hash = (data) => {
  const secret = process.env.SHA_256_HASH_SECRET;

  const stringData = JSON.stringify(data);

  const sha256Hash = createHmac("SHA256", secret)
    .update(stringData, "utf-8")
    .digest("base64");

  return sha256Hash;
};

// encrypting the payload using encryption algorithm `aes-256-ctr` with a pass key
const getEncryptedMessage = (data) => {
  const key = process.env.ENCRYPT_DECRYPT_SECRET_KEY;
  const iv = process.env.INITIALIZATION_VECTOR_SECRET;

  const stringData = JSON.stringify(data);

  const encrypterIv = createCipheriv("aes-256-ctr", key, iv);
  let encryptedMessage = encrypterIv.update(stringData, "utf8", "hex");
  encryptedMessage += encrypterIv.final("hex");

  return encryptedMessage;
};

// Generate a random integer between min (inclusive) and max (inclusive)


// get an random emement from array @params {array}
function getRandomData(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// creating data stream that long string of | separated encrypted messages
const createAndsendEncryptedMessage = () => {
  const numMessages = Math.floor(Math.random() * (max - min + 1)) + min;
  const encryptedMessage = [];
  for (let i = 0; i < numMessages; i++) {
    const originalMessage = {
      name: getRandomData(data.names),
      origin: getRandomData(data.cities),
      destination: getRandomData(data.cities),
    };

    const sumCheckMessage = {
      ...originalMessage,
      secret_key: getSha256Hash(originalMessage),
    };

    const encryptedMessage = getEncryptedMessage(sumCheckMessage);
    encryptedMessage.push(encryptedMessage);
  }
  return encryptedMessage.join("|");
};

module.exports = {
  createAndsendEncryptedMessage,
  getSha256Hash,
  getEncryptedMessage,
};
