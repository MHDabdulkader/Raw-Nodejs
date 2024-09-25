/*
*  Title: Handle sample
*  Description: Handle sample function
*  Tuitorial Author: Sumit Saha
* 
*  Date: 25 sept 2024
*  
*/

// module scaffolding
const hander ={};

hander.sampleHandler = (requestProperties, callBack)=>{
    console.log(requestProperties);
    callBack(200, {
        message: "This is sample handler",
    })
}

module.exports = hander;