/*
*  Title: Environment for env handle
*  Description: 
    Key Points:
    1. Purpose: Environment variables allow for flexible configuration without hardcoding 
                sensitive information or environment-specific details in the codebase.
    2. Usage: Commonly used to differentiate between development, testing, and production environments.
    
    Examples:
        NODE_ENV=production sets the environment to "production", 
        typically to optimize the app for performance.
    DATABASE_URL stores the connection string for a database, 
    which can vary based on the environment (local, staging, production).
    
    Benefits:
    1. Security: You avoid exposing sensitive information like API keys in your code.
    2. Portability: Applications can adapt to different environments without changes to the core codebase.
    3. Maintainability: Easier to manage configuration settings across multiple environments (e.g., dev, staging, production).
*  Tuitorial Author: Sumit Saha
* 
*  Date: 03 Oct 2024


// Debug:
1. trim() env values;
2. script should be && with nodemon index.

*  
*/

// dependances

// scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: "staging"
}
environments.production = {
    port: 5000,
    envName: "production"
}

// determind which environment passed;
// console.log("Environment file", typeof(process.env.NODE_ENV), " ", process.env.NODE_ENV.trim());

const currentEnvironment = typeof(process.env.NODE_ENV.trim()) === 'string'  ? process.env.NODE_ENV.trim() : 'staging';

// export corresponding environment or default staging:

const environmentToExports = 
            typeof(environments[currentEnvironment]) === 'object' 
                ? environments[currentEnvironment] 
                    : environments.staging;

// console.log("exports to environment", environmentToExports);
module.exports = environmentToExports;