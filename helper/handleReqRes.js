/*
*  Title: handle Request and Response
*  Description: handle Request and Response
*  Tuitorial Author: Sumit Saha
* 
*  Date: 25 sept 2024
*  
*/

// dependance section
const url = require("url"); /// requested based get data and response
const  {StringDecoder}   = require("string_decoder");
const routes = require("../routes/routes");
const {notFoundHandler} = require("../handlers/routesHandlers/notFoundHandler");
const {parseJSON} = require("../helper/utilites")


// module Scaffolding
const handler = {}

handler.handleReqRes = (req, res) =>{

    // requested handle
    // get url and parse
    const parsedURL = url.parse(req.url, true);
    /*
       *  url.parse(req.url, true) here true takes all query like http://localhost:3000/about?a=2&b=5  
            ?a=2&b=5 is the query part. 
        if false parse not takes those query. means http://localhost:3000/about
    */
    const path = parsedURL.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g , '') // trimmedPath mainly replace all unwanted extra symbol which user gave. those symbol replaced by space ''
    const method = req.method.toLowerCase(); // get - post - deleted method 
    const queryStringObject = parsedURL.query;
    const headersObject = req.headers;
    const decoder = new StringDecoder('utf8');

    const requestProperties = {
        path, 
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    }

    const chooseHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    


    // body read all formats from getting buffer means payload
    let realData = '';
    req.on('data', (buffer)=>{
        realData += decoder.write(buffer);
    })
    req.on('end', ()=>{
        realData += decoder.end();
        
        // insert real data into request propertise:
        requestProperties.body = parseJSON(realData);

        // for using realData to means body:
        chooseHandler(requestProperties, (statusCode, payload)=>{
            // safety for statusCode and payload(If payload get blank than a blank object took as payload)
            statusCode = typeof(statusCode) === 'number'? statusCode : 500;
            payload = typeof(payload) === 'object'? payload : {};
    
            // response should be stringify
            const payloadString = JSON.stringify(payload);
    
            /// return response
            res.setHeader("Content-type", "application/json")
            res.writeHead(statusCode);
            res.end(payloadString);
        })
       
    })

    // console.log(path) 

    // response handle
    
} 

module.exports=handler;