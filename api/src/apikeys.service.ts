import { ApiKey } from "./entities/api.entity";

let cache: ApiKey[] = [];
let disabledKeys: number[] = [];

async function getApiKeys(): Promise<ApiKey[]> {
  try {
    await updateCache();
    return cache.filter(
      (key) =>
         key.quantity - key.used > 0 && !disabledKeys.some((id) => id === key.id)
    );
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function updateCache(force = false) {
  if (force || cache.length == 0) {
    cache = await ApiKey.find();
  }
}

async function incrementCounter(key: ApiKey) {
  try {
    key.used++;
    await key.save();
    await updateCache(true);
  } catch (error) {
    throw new Error(`useApiKeys ${key.id} error, email: ${key.email}`);
  }
}

async function disableKeyOneSecond(key: ApiKey) {
  try {
    disabledKeys.push(key.id);
    setTimeout(() => {
      const index = disabledKeys.findIndex((id) => id == key.id);
      if (index !== -1) {
        disabledKeys.splice(index, 1);
      }
    }, 1000);
  } catch (error) {
    throw new Error(`useApiKeys ${key.id} error, email: ${key.email}`);
  }
}

async function getRandomApi(): Promise<ApiKey> {
  const keys = await getApiKeys();
  if (keys.length === 0) {
    throw new Error("Keys has been consumed");
  }
  const index = Math.floor(Math.random() * keys.length);
  return keys[index];
}

export const apiKeyService = {
  getApiKeys,
  incrementCounter,
  getRandomApi,
  updateCache,
};
