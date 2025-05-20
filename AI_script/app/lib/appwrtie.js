import { Client, Account, Databases } from 'react-native-appwrite';


const config = {
    endpoint : 'https://fra.cloud.appwrite.io/v1',
    projectId : '681f40db003e782fde55',
    db: "681f410e003153629b54",
    col:{
        user: "681f412c0019d0352b02",
        cloudscripts: "681f7f320008aadb9cd9",
        progress: "681fd26f001a7434cb2c",
    }
}


const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('681f40db003e782fde55')
    .setPlatform('com.anonymous.AI_script');

const database = new Databases(client)
export {database, config, client}