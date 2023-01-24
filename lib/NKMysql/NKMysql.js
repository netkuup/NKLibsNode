import mysql from 'mysql';

class NKMysql {

    constructor() {
        this.con = null;
        this.pass = "";
    }

    connect( host, user, password, database ) {
        this.con = mysql.createConnection({
            host: host,
            user: user,
            password: password,
            database: database
        });

        this.con.connect(function(err) {
            if (err) throw err;
            console.log("Connected to mysql.");
        });
    }

    query( sql, bind, cbk = null ) {
        if ( cbk === null ) {
            this.con.query(sql, bind);
        } else {
            this.con.query(sql, bind, cbk);
        }
    }

    async rollback() {
        await this.con.rollback();
    }
    async beginTransaction() {
        await this.con.rollback();
        await this.con.beginTransaction();
    }
    async commit() {
        await this.con.commit();
    }

}

export { NKMysql };