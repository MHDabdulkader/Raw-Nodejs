/*
 *  Title: Handle checking
 *  Description: Handle checking function
 *  Tuitorial Author: Sumit Saha
 *
 *  Date: 16 oct 2024
 *
 */

/*

post: 
{
  "protocol": "http",
  "url": "google.com",
  "method": "GET",
  "successCodes": [200, 201],
  "timeoutSeconds": 2
}


*/
// dependencies:
// import Data = require("./../../lib/data");

const Data = require("../../lib/data");
const { hash, parseJSON, createRandomString } = require("../../helper/utilites");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require('../../helper/environments')

// module scaffolding
const hander = {};

hander.checkHandler = (requestProperties, callBack) => {
   const acceptedMethod = ["put", "post", "get", "delete"];
   if (acceptedMethod.indexOf(requestProperties.method) >= 0) {
      hander._check[requestProperties.method](requestProperties, callBack);
   } else {
      callBack(405);
   }
};
hander._check = {};

hander._check.post = (requestProperties, callBack) => {
   let protocol =
      typeof requestProperties.body.protocol === "string" &&
         ["http", "https"].indexOf(requestProperties.body.protocol) >= 0
         ? requestProperties.body.protocol
         : false;

   let url =
      typeof requestProperties.body.url === "string" &&
         requestProperties.body.url.trim().length > 0
         ? requestProperties.body.url
         : false;

   let method =
      typeof requestProperties.body.method === "string" &&
         ["GET", "POST", "PUT", "DELETE"].indexOf(
            requestProperties.body.method
         ) >= 0
         ? requestProperties.body.method
         : false;

   let successCodes =
      typeof requestProperties.body.successCodes === "object" &&
         requestProperties.body.successCodes instanceof Array
         ? requestProperties.body.successCodes
         : false;

   // wait for response from url 1s to 5s otherwise ignore
   let timeoutSeconds =
      typeof requestProperties.body.timeoutSeconds === "number" &&
         requestProperties.body.timeoutSeconds % 1 === 0 &&
         requestProperties.body.timeoutSeconds >= 1 &&
         requestProperties.body.timeoutSeconds <= 5
         ? requestProperties.body.timeoutSeconds
         : false;

   if (protocol && url && method && successCodes && timeoutSeconds) {
      let token =
         typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;
      // find token that on database
      Data.read("token", token, (tokenFileReadError, tokenData) => {
         if (!tokenFileReadError && tokenData) {
            let parseTokenData = { ...parseJSON(tokenData) };
            let phone = parseTokenData.phone;
            // find user of that token:
            Data.read("users", phone, (userFileReadError, userData) => {
               if (!userFileReadError && userData) {
                  // check the vaildation of that token:
                  tokenHandler._token.verify(token, phone, (tokenIsVaild) => {
                     if (tokenIsVaild) {
                        // parse user data:
                        let parseUserData = { ...parseJSON(userData) }
                        let userChecks = typeof parseUserData.checks === "object" && parseUserData.checks instanceof Array ? parseUserData.checks : [];

                        if (userChecks.length < maxChecks) {
                           // create check id:
                           let checkId = createRandomString(20);

                           let checkObjects = {
                              "id": checkId,
                              "userPhone": phone,
                              protocol,
                              url,
                              method,
                              successCodes,
                              timeoutSeconds,
                           }

                           // save on data base;
                           Data.create("checks", checkId, checkObjects, (checkWriteError) => {
                              if (!checkWriteError) {
                                 // enter checkId on users objects
                                 parseUserData.checks = userChecks;
                                 parseUserData.checks.push(checkId);

                                 // update users objects
                                 Data.update("users", phone, parseUserData, (updateChecksUserError) => {
                                    if (!updateChecksUserError) {
                                       // oppside could show that object
                                       callBack(200, checkObjects);
                                    }
                                    else {
                                       callBack(500, {
                                          error: "update issue"
                                       })
                                    }
                                 })
                              }
                              else {
                                 callBack(500, {
                                    error: checkWriteError
                                 })
                              }
                           })
                        }
                        else {
                           callBack(401, {
                              error: "checks limit over"
                           })
                        }

                     }
                     else {
                        callBack(403, {
                           error: "Authentication vaildation is expires or problem on token"
                        })
                     }
                  })
               }
               else {
                  callBack(400, {
                     error: "User not find"
                  })
               }
            })

         }
         else {
            callBack(403, {
               error: "Authentication problem"
            })
         }
      })
   }
   else if (!timeoutSeconds) {
      callBack(400, {
         error: "time out second should be between 1 to 5s"
      })
   }
   else {
      callBack(400, {
         error: "There was problem on your request"
      })
   }
};

hander._check.put = (requestProperties, callBack) => { };

// auth check
hander._check.get = (requestProperties, callBack) => { };

hander._check.delete = (requestProperties, callBack) => { };

module.exports = hander;
