import { createClient } from "redis";

let redisClient: any;

export const newClient = async () => {
  if (redisClient && redisClient.isOpen) {
    return redisClient; // reuse connection
  }

  redisClient = createClient({url: 'redis://127.0.0.1:6379'});

  redisClient.on("error", (err : any) =>
    console.log("Redis Client Error", err)
  );

  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Could not connect to Redis. Ensure Redis server is running." , error);
  }

  return redisClient;
};


// await client.set('key', 'value');
// const value = await client.get('key');
// console.log(value); // >>> value

// await client.hSet('user-session:123', {
//     name: 'John',
//     surname: 'Smith',
//     company: 'Redis',
//     age: 29
// })

// let userSession = await client.hGetAll('user-session:123');
// console.log(JSON.stringify(userSession, null, 2));
// /* >>>
// {
//   "surname": "Smith",
//   "name": "John",
//   "company": "Redis",
//   "age": "29"
// }
//  */

// await client.quit();
