/*
*  Title: Utilites
*  Description: 
    list of utilites: 
*  Tuitorial Author: Sumit Saha
* 
*  Date: 17 Oct 2024




*  
*/

// dependances
const crypto = require("crypto");
const environments = require("./environments");

// scaffolding
const utilites = {};

// parse json string to Objects: check is parameter json or not;
utilites.parseJSON = (jsonString) => {
    let output;

    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }
    return output;
}


// hash strings
utilites.hash = (str) => {

    if (typeof (str) === "string" && str.length > 0) {
        const hashing = crypto
            .createHmac('sha256', environments.secretKey)
            .update(str)
            .digest('hex');

        return hashing;
    }
    else {
        return false;
    }
}


// create random string
utilites.createRandomString = (strLength) => {
    let length = strLength;

    length = typeof (length) === "number" && length > 0 ? length : false;

    if (length) {
        let possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        let lengthP = possibleCharacters.length;
        let outputString = "";
        for (let i = 0; i < length; i++) {
            const randomCharacter = possibleCharacters.charAt(Math.round(Math.random() * lengthP))

            outputString += randomCharacter;
        }
        // console.log("random string lenght ",outputString.length);
        return outputString;
    }
    else {
        return false;
    }

}



// exports
module.exports = utilites;