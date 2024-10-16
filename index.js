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
const environment = require('./helper/environments');
const data = require('./lib/data');


// App object - module scaffolding (here i store or save the next working processes )

const app = {};

// testing file write
// @TODO remove after tested:
// data.create('test', 'newFile', {name:"Bangladesh", language: "Bangla"}, (TestingError)=>{
//     console.log(`Test to ${TestingError}`);
// }) 

// data.read('test', 'newFile', (error, data)=>{
//     console.log(error, data)
// })

//  data.update('test', 'newFile', {"name":"England", "language":"British-english"}, (error)=>{
//     console.log(error);
//  })

data.delete('test', 'newFile', (error)=>{
    console.log(error);
})

// create a server

app.createServer = () =>{
    const server = http.createServer(app.handleReqRes);

    // run server
    server.listen(environment.port, ()=>{
        // console.log(environment)
       
        // cmd code: $env:NODE_ENV="production"; node index
        console.log(`Listening to port ${environment.port}`);
    });
}

// handle Request and Response

app.handleReqRes = handleReqRes;


// start server 
app.createServer();