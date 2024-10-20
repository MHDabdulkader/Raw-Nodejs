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

hander._check.put = (requestProperties, callBack) => {
   // body compulsary: check id:
   const id = typeof requestProperties.body.id === "string" && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

   // updated values on req body:
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

   if (id) {
      if (protocol || url || method || successCodes || timeoutSeconds) {
         // id -> check id on (req: body)
         Data.read("checks", id, (checkReadError, checkData) => {
            if (!checkReadError && checkData) {
               const checkObjects = parseJSON(checkData);
               const token = typeof requestProperties.headersObject.token === "string" ? requestProperties.headersObject.token : false;

               tokenHandler._token.verify(token, checkObjects.userPhone, (tokenVaild) => {
                  if (tokenVaild) {
                     if (protocol) {
                        checkObjects.protocol = protocol;
                     }
                     if (url) {
                        checkObjects.url = url;
                     }
                     if (method) {
                        checkObjects.method = method;
                     }
                     if (successCodes) {
                        checkObjects.successCodes = successCodes;
                     }
                     if (timeoutSeconds) {
                        checkObjects.timeoutSeconds = timeoutSeconds;
                     }

                     Data.update("checks", id, checkObjects, (updateError) => {
                        if (!updateError) {
                           callBack(200, {
                              "message": "checks update"
                           })
                        }
                        else {
                           callBack(500, {
                              error: "server side update problem!"
                           })
                        }
                     })


                  }
                  else {
                     callBack(403, {
                        error: "Authorization is not vaild"
                     })
                  }
               })
            }
            else {
               callBack(500, {
                  error: "Check is not founded"
               })
            }
         })
      }
      else {
         callBack(400, {
            error: "Provide some else then id for update checks"
         })
      }
   }
   else {
      callBack(400, {
         error: "There is problem on your request"
      })
   }
};

// auth check
hander._check.get = (requestProperties, callBack) => {
   const id =
      typeof requestProperties.queryStringObject.id === "string" &&
         requestProperties.queryStringObject.id.trim().length === 20
         ? requestProperties.queryStringObject.id
         : false;
   if (id) {
      Data.read("checks", id, (checkReadError, checkData) => {
         if (!checkReadError && checkData) {
            // token and its validation:
            let token = typeof requestProperties.headersObject.token === "string" ? requestProperties.headersObject.token : false;

            if (token) {
               // parse check data;
               let parseCheckData = parseJSON(checkData);
               let phone = parseCheckData.userPhone;
               tokenHandler._token.verify(token, phone, (verifyVaild) => {
                  if (verifyVaild) {
                     callBack(200, parseCheckData);
                  }
                  else {
                     callBack(403, {
                        error: "Authorization error!"
                     })
                  }
               })
            }
            else {
               callBack(403, {
                  error: "Authorization token missing error!"
               })
            }
         }
         else {
            callBack(500, {
               error: "Server side error"
            })
         }
      })
   }
   else {
      callBack(404, {
         error: "There is problem on your requested"
      })
   }
};



hander._check.delete = (requestProperties, callBack) => {
   const id =
      typeof requestProperties.queryStringObject.id === "string" &&
         requestProperties.queryStringObject.id.trim().length === 20
         ? requestProperties.queryStringObject.id
         : false;
   if (id) {
      Data.read("checks", id, (checkReadError, checkData) => {
         if (!checkReadError && checkData) {
            // token and its validation:
            let token = typeof requestProperties.headersObject.token === "string" ? requestProperties.headersObject.token : false;

            if (token) {
               // parse check data;
               let parseCheckData = parseJSON(checkData);
               let phone = parseCheckData.userPhone;
               tokenHandler._token.verify(token, phone, (verifyVaild) => {
                  if (verifyVaild) {
                     // delete check
                     Data.delete("checks", id, (deleteError)=>{
                        if(!deleteError){
                           // deleted that check from user too.
                           Data.read("users", phone, (readError, userData)=>{
                              if(!readError && userData){
                                 let userObject = parseJSON(userData);
                                 
                                 let userChecks = typeof userObject.checks === "object" && userObject.checks instanceof Array ? userObject.checks : [];

                                 // index of id on checks
                                 let indexCheck = userChecks.indexOf(id);

                                 if(indexCheck >= 0){
                                    userChecks.splice(indexCheck, 1);

                                    userObject.checks = userChecks;

                                    // update on user folder user check deleted
                                    Data.update("users", phone, userObject, (userUpdateError)=>{
                                       if(!userUpdateError){
                                          callBack(200);
                                       }
                                       else{
                                          callBack(500, {
                                             error: "Server side problem, (update user on deleted checks)"
                                          })
                                       }
                                    })
                                 }
                                 else{
                                    callBack(400, {
                                       error: `${userObject.firstName}  ${userObject.lastName} is not used that check`
                                    })
                                 }
                              }
                              else{
                                 callBack(404, {
                                    error: "user not founded"
                                 })
                              }
                           })


                        }else{
                           callBack(500, {
                              error: "Server side problem"
                           })
                        }
                     })
                  }
                  else {
                     callBack(403, {
                        error: "Authorization error!"
                     })
                  }
               })
            }
            else {
               callBack(403, {
                  error: "Authorization token missing error!"
               })
            }
         }
         else {
            callBack(500, {
               error: "Server side error"
            })
         }
      })
   }
   else {
      callBack(404, {
         error: "There is problem on your requested"
      })
   }
};

module.exports = hander;
