const redis = require('redis');
const REDISCLOUD_URL="redis://redis-17819.c14.us-east-1-2.ec2.cloud.redislabs.com:17819";
const client = redis.createClient(REDISCLOUD_URL, {no_ready_check: true});
client.auth('PhfZDDH19vLX3xwKPO0JkUxJpYtK1b2R', () => {
    console.log('authenticated');
    const config = {
        key: 'ptL8G',
        title: 'מסיבת סיום',
        subTitle: '26.6.2019'
    };
    client.set('ptL8G', JSON.stringify(config) , redis.print);
    client.get('ptL8G', (e, r) => console.log(JSON.parse(r)));
});
