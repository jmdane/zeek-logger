const fs = require("fs").promises;
const config = require("./config.json");
const axios = require('axios');
const {createChecker} = require('is-in-subnet');
const checker = createChecker(config.subnet);

async function ReadUpload(){
    //Read and upload file
    try{
        let data = await fs.readFile(config.file_path, {encoding: 'utf8'});
        data = data.split("\n");
        data.splice(0, 8);
        let hosts = [];
        for(let _data of data){
            if(_data.includes("\t")){
                let splitData = _data.split("\t");
                let ip_source = splitData[2];
                let ip_dest = splitData[4];
                if(checker(ip_source) && !hosts.includes(ip_source)){
                    hosts.push(ip_source);
                }
                if(checker(ip_dest) && !hosts.includes(ip_dest)){
                    hosts.push(ip_dest);
                }
            }
        }
        let response = await axios.post(config.url,hosts);
        return response.status === 204;
    }catch(error){
        console.log(error.message);
        return false;
    }
}

function main(){
    //Main Loop
    if(config.scan_on_restart){
        let response = ReadUpload();
        if(!response){
            console.log(`${new Date()} : Read and Upload script failed`);
        }
    }
    let delayInterval = config.interval_minutes * 60 * 1000;
    let readInterval = setInterval(()=>{
        ReadUpload();
    },delayInterval)
}

main();


