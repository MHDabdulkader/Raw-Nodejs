/*
 *  Title: Handle user
 *  Description: Handle user function
 *  Tuitorial Author: Sumit Saha
 *
 *  Date: 16 oct 2024
 *
 */
// dependencies:
// import Data = require("./../../lib/data");

const Data = require("../../lib/data");
const { hash, parseJSON } = require("../../helper/utilites");
const tokenHandler = require("./tokenHandler");

// module scaffolding
const hander = {};

hander.userHandler = (requestProperties, callBack) => {
    const acceptedMethod = ["put", "post", "get", "delete"];
    if (acceptedMethod.indexOf(requestProperties.method) >= 0) {
        hander._user[requestProperties.method](requestProperties, callBack);
    } else {
        callBack(405);
    }
};
hander._user = {};

hander._user.post = (requestProperties, callBack) => {
    const firstName =
        typeof requestProperties.body.firstName === "string" &&
            requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === "string" &&
            requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

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

    const tosAgreement =
        typeof requestProperties.body.tosAgreement === "boolean"
            ? requestProperties.body.tosAgreement
            : false;

    if (firstName && lastName && password && phone && tosAgreement) {
        // check inputs are exists or not;
        // const data
        Data.read("users", phone, (FileExistsError) => {
            if (FileExistsError) {
                // toward to next step mean write option
                const hashing = hash(password);
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hashing,
                    tosAgreement,
                };

                // store on database:
                Data.create("users", phone, userObject, (createUserError) => {
                    if (!createUserError) {
                        callBack(200, {
                            message: "Welcome Your Sign Up done!",
                        });
                    } else {
                        callBack(500, {
                            error: createUserError,
                        });
                    }
                });
            } else {
                callBack(500, {
                    error: "There is a server read side issue!",
                });
            }
        });
    } else {
        callBack(400, {
            error: "maybe blank some fields",
        });
    }
};

hander._user.put = (requestProperties, callBack) => {
    const firstName =
        typeof requestProperties.body.firstName === "string" &&
            requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === "string" &&
            requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

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

    if (phone) {
        if (firstName || lastName || password) {
            // look up user by phone number in file directory.
            // if file open for read then provide phone number is valid

            let token =
            typeof requestProperties.headersObject.token === "string"
                ? requestProperties.headersObject.token
                : false;
            if(token){
                tokenHandler._token.verify(token, phone, (verifyOk)=>{
                    if(verifyOk){
                        Data.read("users", phone, (errorRead, uData) => {
                            let userData = { ...parseJSON(uData) };
                            if (!errorRead && userData) {
                                if (firstName) {
                                    userData.firstName = firstName;
                                }
                                if (lastName) {
                                    userData.lastName = lastName;
                                }
                                if (password) {
                                    userData.password = hash(password);
                                }
            
                                Data.update("users", phone, userData, (updateError) => {
                                    if (!updateError) {
                                        callBack(200, {
                                            message: "Update done and preserved!",
                                        });
                                    }
                                    // console.log(`Update done ${phone}`);
                                    else {
                                        callBack(500, {
                                            error: updateError,
                                        });
                                    }
                                });
                            } else {
                                callBack(400, {
                                    error: "Check your request. ",
                                });
                            }
                        });
                    }
                    else{
                        callBack(403,{
                            error: "unauthorize activity"
                        })
                    }
                })
            }
            else{
                callBack(400, {
                    error: "unauthorize activity"
                })
            }


            
        } else {
            callBack(400, {
                error: "Check your request. ",
            });
        }
    } else {
        callBack(400, {
            error: "Invaild phone number try again",
        });
    }
};

// auth check
hander._user.get = (requestProperties, callBack) => {
    const phone =
        typeof requestProperties.queryStringObject.phone === "string" &&
            requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;

    if (phone) {
        // check token for header objects:
        let token =
            typeof requestProperties.headersObject.token === "string"
                ? requestProperties.headersObject.token
                : false;

        if (token) {
            tokenHandler._token.verify(token, phone, (verifyOk) => {
                if (verifyOk) {
                    Data.read("users", phone, (readError, user) => {
                        if (!readError) {
                            const parseData = parseJSON(user);
                            delete parseData.password;
                            callBack(200, {
                                "User information": parseData,
                            });
                        } else {
                            callBack(500, {
                                Error: "Server side read error",
                            });
                        }
                    });
                } else {
                    callBack(403, {
                        message: "Unauthorize activity",
                    });
                }
            });
        } else {
            callBack(400, {
                error: "Unauthorize activity",
            });
        }
    } else {
        callBack(404, {
            error: "User not founded!",
        });
    }
};


hander._user.delete = (requestProperties, callBack) => {
    const phone =
        typeof requestProperties.queryStringObject.phone === "string" &&
            requestProperties.queryStringObject.phone.trim().length === 11
            ? requestProperties.queryStringObject.phone
            : false;
    if (phone) {
        let token =
            typeof requestProperties.headersObject.token === "string"
                ? requestProperties.headersObject.token
                : false;
        if (token) {
            tokenHandler._token.verify(token, phone, (verifyOk) => {
                if (verifyOk) {
                    Data.read("users", phone, (error, userData) => {
                        if (!error && userData) {
                            Data.delete("users", phone, (deletedError) => {
                                if (deletedError) {
                                    callBack(500, {
                                        error: "Server side problem",
                                    });
                                } else {
                                    callBack(200, {
                                        message: "user deleted done!",
                                    });
                                }
                            });
                        } else {
                            callBack(500, {
                                error: "Server side problem",
                            });
                        }
                    });
                }
                else {
                    callBack(403, {
                        error: "un authorize activity"
                    })
                }
            })
        }
        else {
            callBack(400, {
                error: "unauthorize activity"
            })
        }


    } else {
        callBack(400, {
            error: "Check the phone number",
        });
    }
};

module.exports = hander;
