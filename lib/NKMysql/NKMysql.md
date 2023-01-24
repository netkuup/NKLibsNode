# NKMysql

## Usage

    import {NKMysql} from 'nklibs-node';



NKMysql.connect( host, user, password, database )
----------------------------------------------------------------------------
    let database = new NKMysql();

    database.connect("localhost", "root", "", "my_database_name");


NKMysql.query( sql, bind_params, callback )
----------------------------------------------------------------------------
Example 1: Select

    let sql = "SELECT * FROM customers WHERE address = 'Avenida Diagona 83'";

    database.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log( result );
    });

Example 2: Select with params

    let sql = 'SELECT * FROM customers WHERE address = ?';
    let adr = 'Avenida Diagona 83';

    database.query(sql, [adr], function (err, result) {
        if (err) throw err;
        console.log(result);
    });

Example 3: Insert

    let sql = "INSERT INTO customers (name, address) VALUES ('Juan', 'Avenida Diagona 83')";
    
    database.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });

Example 4: Insert with params

    let sql = "INSERT INTO customers (name, address) VALUES ?";

    let values = [
        ['Juan', 'Avenida Diagona 83'],
        ['Pedro', 'Calle Aribau 7'],
        ['Maria', 'Passeig de Gràcia 123']
    ];
    database.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
    });




NKMysql.beginTransaction( ) / NKMysql.commit( )
----------------------------------------------------------------------------
* **NKMysql.beginTransaction()**: Start a new transaction.
* **NKMysql.commit()**: Commits the current transaction, making its changes permanent. 


    await database.beginTransaction();

    // Database queries

    await database.commit();


NKMysql.rollback( )
----------------------------------------------------------------------------
Rolls back the current transaction, canceling its changes.

    await database.rollback();


