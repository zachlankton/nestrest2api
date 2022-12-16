import { validate } from 'class-validator';

export async function sanitize(
  sType: new () => any,
  sInput: { [x: string]: any },
) {
  const sanitizedObject: any = new sType();
  Object.keys(sInput).forEach(
    (key: string | number) => (sanitizedObject[key] = sInput[key]),
  );
  await validate(sanitizedObject, { whitelist: true });
  return sanitizedObject;
}
