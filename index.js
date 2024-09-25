/*
*  Title: Uptime monitoring Application
*  Description: A RESTFul API to moitoring up or down time of user defined links
        Setup nodemon cmd: npm install -g nodemon 
            run nodemon: nodemon index / npm start after script write on package.json
*  Tuitorial Author: Sumit Saha
* 
*  Date: 25 sept 2024
*  
*/

// Dependencies
/// for server: call http
const http = require("http");
const url = require("url"); /// requested based get data and response
const  {StringDecoder}   = require("string_decoder");
const {handleReqRes} = require("./helper/handleReqRes")


// App object - module scaffolding (here i store or save the next working processes )

const app = {};

// configuration section
app.config = {
    port : 3000
};

// create a server

app.createServer = () =>{
    const server = http.createServer(app.handleReqRes);

    // run server
    server.listen(app.config.port, ()=>{
        console.log(`Listening to port ${app.config.port}`);
    });
}

// handle Request and Response

app.handleReqRes = handleReqRes;


// start server 
app.createServer();