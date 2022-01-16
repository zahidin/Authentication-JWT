const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

redisClient.on('connect', () => console.log('Connected to redis...'));

redisClient.on('error', function (err) {
  console.log('Error ' + err);
});

module.exports = redisClient;
