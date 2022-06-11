const fs = require("fs").promises;
const config = require("./config.json");
const axios = require('axios');

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
                let timestamp = Number(splitData[0]);
                let ip = splitData[1];
                hosts.push({
                    time: timestamp,
                    host: ip
                })
            }
        }
        let response = await axios.post(config.url,hosts);
        if(response.status === 204){
            return true;
        } else {
            return false;
        }
        return false;
    }catch(error){
        console.log(error);
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


