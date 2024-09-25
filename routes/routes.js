/*
*  Title: Routes
*  Description: Router for Application , router path is the Trimmed part 
                according to the route call the function which work on that router response.
*  Tuitorial Author: Sumit Saha
* 
*  Date: 25 sept 2024
*  
*/

// dependanices:
const {sampleHandler} = require("../handlers/routesHandlers/sampleHandler")


const routes ={
    sample: sampleHandler
}


module.exports = routes;


