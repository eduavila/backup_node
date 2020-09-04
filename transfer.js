var tar = require('tar-fs');
var zlib = require('zlib');
var fs = require('fs');
var moment = require('moment');

/**
 * Transfers an entire directory locally by compressing, downloading and extracting it locally.
 * 
 * @param {SSH} conn A ssh connection of the ssh2 library
 * @param {String} remotePath 
 * @param {String} localPath 
 * @param {Integer|Boolean} compression 
 * @param {Function} cb Callback executed once the transfer finishes (success or error)
 * @see http://stackoverflow.com/questions/23935283/transfer-entire-directory-using-ssh2-in-nodejs
 */
exports.transferDirectory = function(conn, remotePath, localPath,nameFile, compression, cb){
    var cmd = 'cd ' + remotePath + ' && tar cf - * 2>/dev/null';

    if (typeof compression === 'function'){
        cb = compression;
    }else if (compression === true){
        compression = 6;
    }

    // Apply compression if desired
    if (typeof compression === 'number' && compression >= 1 && compression <= 9){
        cmd += ' | gzip -' + compression + 'c 2>/dev/null';
    }else{
        compression = undefined;
    }

    conn.exec(cmd, function (err, stream) {
        if (err){
            return cb(err);
        }
            
        var exitErr;
        const filePathTar = localPath + nameFile +'_' + moment().format('DDMMYYYY_HHmm') + '.gz';
        var out1 = fs.createWriteStream( localPath + nameFile +'_' + moment().format('DDMMYYYY_HHmm') + '.gz');

        stream.pipe(zlib.createGunzip()).pipe(out1);

        out1.on('finish', function(){
            cb(exitErr,filePathTar);
        })
    });
}


