//const fs = require('fs');
//const path = require('path');

//Developing, not tested

function NKFiledb( path = null, load = true, big = false ) {
    this.big = big;
    this.path = "";
    this.dir = "";
    this.data = [];
    if ( path !== null ) this.setPath( path, load );
}

NKFiledb.prototype.setPath = function( path, load = true, only_if_diferent = false ) {
    if ( only_if_diferent && this.path === __dirname + "/" + path ) return;

    this.path = __dirname + "/" + path;
    this.dir = path_lib.dirname( this.path );

    if ( !fs.existsSync(this.dir) )  fs.mkdirSync(this.dir, { recursive: true } );

    if ( load ) this.loadFile();
}

NKFiledb.prototype.loadFile = function() {
    this.data = [];
    // Sino existe ya se creará al guardar por primera vez

    if ( fs.existsSync(this.path) ) {
        if ( !this.big ) {
            let file_data = fs.readFileSync( this.path, 'utf8' );
            this.data = JSON.parse(file_data);
        } else {

            let buffer = Buffer.alloc(1024);
            let fd = fs.openSync(this.path, 'r');
            let line = '';
            let bytesRead = 0;
            let temp_data = [];

            function addLine(line) {
                if ( line === "[" || line === "]" ) return;
                if ( line.endsWith(" ") ) line = line.slice(0, -1);
                if ( line.endsWith(",") ) line = line.slice(0, -1);

                temp_data.push(JSON.parse(line));
            }

            while ((bytesRead = fs.readSync(fd, buffer, 0, 1024, null)) !== 0) {
                for (let i = 0; i < bytesRead; i++) {
                    const char = String.fromCharCode(buffer[i]);
                    if (char === '\n') {
                        addLine( line );
                        line = '';
                    } else {
                        line += char;
                    }
                }
            }

            if ( line.length > 0 ) {// Procesar la última línea
                addLine( line );
            }

            fs.closeSync(fd);
            this.data = temp_data;
        }


    }

};

NKFiledb.prototype.lasModMins = function( err = null ) {
    if ( !fs.existsSync(this.path) ) return err;
    let file_timestamp = NKDate.getUnixTimestamp( fs.statSync(this.path).mtime );
    let now_timestamp = NKDate.getUnixTimestamp( new Date() );
    return (now_timestamp-file_timestamp)/60000;
}

NKFiledb.prototype.lasModDate = function( err = null ) {
    if ( !fs.existsSync(this.path) ) return err;
    return fs.statSync(this.path).mtime;
}

NKFiledb.prototype.saveFile = function() {

    if ( !this.big ) {
        let file_data = JSON.stringify( this.data, null, 2 ); //Si el objeto es demasiado grande esta funcion peta por falta de memoria.
        fs.writeFileSync(this.path, file_data);

    } else {
        fs.writeFileSync(this.path, "[\n");

        let len = this.data.length;
        let comma = "";
        for ( let i = 0; i < len; i++ ) {
            comma = ( i === len-1 ) ? "" : ", ";
            fs.appendFileSync(this.path, JSON.stringify(this.data[i]) + comma + "\n" );
        }

        fs.appendFileSync(this.path, "]");
    }

    console.log('File has been saved!', this.path);
};

NKFiledb.prototype.deleteFile = function() {
    try {
        fs.unlinkSync( this.path );
    } catch (e) {
        return {success: false, error: e};
    }
    return {success: true};
};


NKFiledb.prototype.select = function( where, limit = Number.MIN_VALUE ) {
    let found = false;
    let result = [];

    for ( let i = 0; i < this.data.length; i++ ) {
        let row = this.data[i];

        found = true;
        for( let key in where ) {
            if ( row[key] !== where[key] ) {
                found = false;
                break;
            }
        }

        if ( found ) result.push(row);
        if ( result.length >= limit ) return result;
    }

    return result;
};

NKFiledb.prototype.select_row = function( where ) {
    let result = this.select( where, 1 );
    return (result.length > 0) ? result[0] : null;
};

/*
nft_db.update({name: "james", telf: "123"}, function (row) {
    delete row["mail"];

    return row;
});
 */
NKFiledb.prototype.update = function( where, row_cbk, save = true ) {
    let result = this.select( where, 1 );
    if ( result.length === 0 ) return false;

    let new_row = row_cbk( NKObject.clone(result[0]) );

    // result[0] es una referencia
    Object.keys(result[0]).forEach(key => delete result[0][key]);
    Object.keys(where).forEach(key => result[0][key] = where[key]);
    Object.keys(new_row).forEach(key => result[0][key] = new_row[key]);

    if ( save ) this.saveFile();
};

NKFiledb.prototype.insert_update = function( where, insert, save = true ) {
    let result = this.select_row( where );

    if ( result === null ) {
        result = NKObject.clone(where);
        this.data.push(result);
    }

    for( let key in insert ) {
        result[key] = insert[key];
    }

    if ( save ) this.saveFile();
};

NKFiledb.prototype.insert = function( insert, save = true ) {
    this.data.push(insert);

    if ( save ) this.saveFile();
};

NKFiledb.prototype.delete = function( where, save = true ) {
    let found;

    for ( let i = this.data.length-1; i >= 0; i-- ) {
        let row = this.data[i];

        found = true;
        for( let key in where ) {
            if ( row[key] !== where[key] ) {
                found = false;
                break;
            }
        }

        if ( found ) this.data.splice(i, 1);
    }

    if ( save ) this.saveFile();
};