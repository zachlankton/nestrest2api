import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const algorithm = 'aes-256-gcm';
const secretKey = process.env.ENCRYPTION_KEY as string;

const encrypt = (text: string) => {
  const iv = randomBytes(16);

  const cipher = createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return {
    authTag: authTag.toString('hex'),
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  };
};

type hashObj = {
  iv: string;
  content: string;
  authTag: string;
};

const decrypt = (hash: string | hashObj) => {
  if (typeof hash === 'string') hash = JSON.parse(hash) as hashObj;

  if (!hash.iv && !hash.content && !hash.authTag)
    throw {
      err: true,
      message: 'Cannot decrypt! Encrypted data is not in expected format!',
    };

  const decipher = createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(hash.authTag, 'hex'));

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ]);

  return decrpyted.toString();
};

export { encrypt, decrypt };
