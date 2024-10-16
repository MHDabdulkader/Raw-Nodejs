
// dependance:
const fs = require('fs');
const path = require('path');

// scaffolding
const lib = {}

// __dirname : given current directory mean lib folder, data.js 
lib.basedir = path.join(__dirname, '/../.data/')  //   '/../ for back to one step behind;

// console.log("base dir" ,lib.basedir);


// write on file
lib.create =  (dir, file, data, callback) => {
    console.log("base dir" ,lib.basedir);
    console.log("Full directory  ", `${lib.basedir + dir}/${file}.json`);

    // open file by fs wx flag
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (OpenError, fileDescriptor) => {
        if (!OpenError && fileDescriptor) {
            // data to stringfy
            const stringData = JSON.stringify(data);

            fs.writeFile(fileDescriptor, stringData, (WriteError) => {
                if (!WriteError) {
                    fs.close(fileDescriptor, (CloseError) => {
                        if (!CloseError) {
                            callback(true)
                        }
                        else {
                            callback('Error closing new file')
                        }
                    })
                }
                else {
                    callback('Error to writing new file');
                }

            })

        }
        else {
            callback(`Could not create new file, it may be already existing ${OpenError}`);
        }
    })

};

// read file
lib.read = (dir, file, callback) =>{
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (readError, data)=>{
        
        callback(readError, data);
    })
};

// update file
lib.update = (dir, file, data, callback) =>{
    // file open
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (openError, fileDescriptor)=>{
        if(!openError && fileDescriptor){
            // truncate files
            fs.ftruncate(fileDescriptor, (truncateError)=>{
                if(!truncateError){
                    // convert to string
                    const stringfyData = JSON.stringify(data);
                    // write file
                    fs.write(fileDescriptor, stringfyData, (writeError)=>{
                        if(!writeError){
                            // flie closed
                            fs.close(fileDescriptor, (closeError)=>{
                                if(!closeError){
                                    callback("file write done and closed file done");
                                }
                                else callback("close file error");
                            })
                        }
                        else{
                            callback("error to write on file")
                        }
                    })
                }
                else{
                    callback("Truncate Error");
                }
            })
        }
        else {
            callback("Error at open file ");
        }
    })
};


// deleted file
lib.delete = (dir, file, callback)=>{
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (deleteError)=>{
        if(!deleteError){
            callback("File deleted done");
        }
        else {
            callback("Error file deleting!");
        }
    })
}

module.exports = lib