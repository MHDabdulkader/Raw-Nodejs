/*
*  Title: Not found handler
*  Description: Response if no handler match with routes. 
*  Tuitorial Author: Sumit Saha
* 
*  Date: 25 sept 2024
*  
*/


const handler = {};

handler.notFoundHandler = (requestProperties, callBack)=>{
    // console.log("Error: Handler for routes is not founded.")
    
    console.log(requestProperties);
    callBack(404, {
        message: "This is not foundHandler",
    })
}

module.exports = handler;