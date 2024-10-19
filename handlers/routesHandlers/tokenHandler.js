/*
 *  Title: Handle token handler
 *  Description: Handle tokens
 *  Tuitorial Author: Sumit Saha
 *
 *  Date: 19 oct 2024
 *
 */
// dependencies:
// import Data = require("./../../lib/data");

const Data = require("../../lib/data");
const {
    hash,
    parseJSON,
    createRandomString,
} = require("../../helper/utilites");

// module scaffolding
const hander = {};

hander.tokenHandler = (requestProperties, callBack) => {
    const acceptedMethod = ["put", "post", "get", "delete"];
    if (acceptedMethod.indexOf(requestProperties.method) >= 0) {
        hander._token[requestProperties.method](requestProperties, callBack);
    } else {
        callBack(405);
    }
};
hander._token = {};

hander._token.post = (requestProperties, callBack) => {
    const phone =
        typeof requestProperties.body.phone === "string" &&
            requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;

    const password =
        typeof requestProperties.body.password === "string" &&
            requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;
    if (phone && password) {
        Data.read("users", phone, (readUserError, uData) => {
            if (!readUserError && uData) {
                let hashpassword = hash(password);
                let userData = { ...parseJSON(uData) };
                if (hashpassword === userData.password) {
                    let tokenId = createRandomString(20);
                    let expires = Date.now() + 60 * 60 * 1000;
                    let tokenObjects = {
                        phone,
                        "id": tokenId,
                        expires,
                    };

                    // save database:
                    Data.create("token", tokenId, tokenObjects, (createTokenError) => {
                        if (!createTokenError) {
                            callBack(200, tokenObjects);
                        } else {
                            callBack(500, {
                                error: "server side error",
                            });
                        }
                    });
                } else {
                    callBack(400, {
                        error: "password is not valid!",
                    });
                }
            } else {
            }
        });
    } else {
        callBack(400, {
            error: "Requested error",
        });
    }
};

hander._token.put = (requestProperties, callBack) => {
    const tokenId =
        typeof requestProperties.body.id === "string" &&
            requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;

    const extended = typeof requestProperties.body.extended === "boolean" && requestProperties.body.extended === true ? requestProperties.body.extended : false;

    if (tokenId && extended) {
        Data.read("token", tokenId, (tokenError, tokenData) => {

            if (!tokenError && tokenData) {
                let parseTokenData = { ...parseJSON(tokenData) };
                if (parseTokenData.expires > Date.now()) {
                    let expiresExtended = Date.now() + 60 * 60 * 1000;
                    parseTokenData.expires = expiresExtended;

                    Data.update("token", tokenId, parseTokenData, (updateError) => {
                        if (!updateError) {
                            callBack(200, {
                                "message": "Expires extended",
                            })
                        }
                        else {
                            callBack(500, {
                                error: "Problem on server side"
                            })
                        }
                    })
                }
                else{
                    callBack(400,{
                        error:"token already expire- create another one"
                    })
                }

            }
            else {
                callBack(400, {
                    error: "token is not founded"
                })
            }
        })
    }
    else {
        callBack(400, {
            error: "maybe be you demanded token expires extendence but exprires still false"
        })
    }

};

hander._token.get = (requestProperties, callBack) => {
    const tokenId =
        typeof requestProperties.queryStringObject.id === "string" &&
            requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;


    if (tokenId) {
        Data.read("token", tokenId, (readToken, tokenData) => {
            if (!readToken && tokenData) {
                let parseTokenData = { ...parseJSON(tokenData) };
                let phone = parseTokenData.phone;

                Data.read("users", phone, (readUser, userData) => {
                    let parseUserData = { ...parseJSON(userData) };
                    delete userData.password;
                    let tokenAndUser = {
                        "id": tokenId,
                        "firstName": parseUserData.firstName,
                        "lastName": parseUserData.lastName,
                        "phone": parseUserData.phone,
                        // "tosAu"
                    }
                    if (!readUser && userData) {
                        callBack(200, tokenAndUser)
                    }
                    else {
                        callBack(500, {
                            error: "There are problem on server side",
                        })
                    }
                })
            }
            else {
                callBack(500, {
                    error: "There are problem on server side",
                })
            }
        })
    }
    else {
        callBack(400, {
            error: "Token invalid",
        })
    }
};
hander._token.delete = (requestProperties, callBack) => { 
    const tokenId =
        typeof requestProperties.queryStringObject.id === "string" &&
            requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    
    if(tokenId){
        Data.read("token", tokenId, (readTokenError, tokenData)=>{
            if(!readTokenError && tokenData){
                Data.delete("token", tokenId, (deleteTokenError)=>{
                    if(!deleteTokenError){
                        callBack(200, {
                            "message": "token delete successful"
                        })
                    }
                    else{
                        callBack(500, {
                            error: "server side problem"
                        })
                    }
                })
            }
            else{
                callBack(400, {
                    error:"token is not founded"
                })
            }
        })
    }
    else{
        callBack(404, {
            error: "Problem on your request"
        })
    }

};

hander._token.verify = (id, phone, callBack)=>{

    Data.read("token", id, (readError, tokenData)=>{
        if(!readError && tokenData){
            let parseTokenData = {...parseJSON(tokenData)};
            const validUser = parseTokenData.id === id && parseTokenData.phone === phone && parseTokenData.expires > Date.now();

            if(validUser){
                callBack(true);
            }
            else{
                callBack(false);
            }
        }
        else{
            callBack(false);
        }
    })
}


module.exports = hander;
