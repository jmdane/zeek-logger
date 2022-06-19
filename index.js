const fs = require("fs").promises;
const config = require("./config.json");
const axios = require('axios');
const {createChecker} = require('is-in-subnet');
const checker = createChecker(config.subnet);

async function ReadUpload(){
    //Read and upload file
    try{
        //Read file
        let data = await fs.readFile(config.file_path, {encoding: 'utf8'});
        //Split into each single line
        data = data.split("\n");
        //Remove the first 9 lines that have information about the file
        data.splice(0, 8);
        let hosts = [];
        //Loop through each line and add to hosts array
        for(let _data of data){
            if(_data.includes("\t")){
                //Split lines into columns
                let splitData = _data.split("\t");
                //Get ip sources and ip destinations
                let ip_source = splitData[2];
                let ip_dest = splitData[4];
                //Check if ip is in subnet and is not in the hosts array already
                if(checker(ip_source) && !hosts.includes(ip_source)){
                    hosts.push(ip_source);
                }
                //Check if ip is in subnet and is not in the hosts array already
                if(checker(ip_dest) && !hosts.includes(ip_dest)){
                    hosts.push(ip_dest);
                }
            }
        }
        //Upload and send to openvas server
        let response = await axios.post(config.url,hosts);
        return response.status === 204;
    }catch(error){
        console.log(error.message);
        return false;
    }
}

function main(){
    //Main Loop
    //If should scan and upload on restart
    if(config.scan_on_restart){
        //Read conn.log and upload
        let response = ReadUpload();
        if(!response){
            console.log(`${new Date()} : Read and Upload script failed`);
        }
    }
    //Interval to scan and upload
    let delayInterval = config.interval_minutes * 60 * 1000;
    //Run scan and upload every interval
    let readInterval = setInterval(()=>{
        ReadUpload();
    },delayInterval)
}

main();


