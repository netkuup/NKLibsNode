import { WebSocketServer } from 'ws';

class NKWebsocket {


    constructor() {
        this.initialized = false;
        this.is_server = true;
        this.writePromises = [];
    }

    listen( ip, port ) {
        if ( this.initialized ) {
            throw "You can't call listen function twice.";
        }
        let self = this;

        this.ip = ip;
        this.port = port;
        this.is_server = true;
        this.initialized = true;


        this.server = new WebSocketServer({ port: port });

        this.server.on('connection', function connection(websocket, req ) {
            var nk_websocket = new NKWebsocket();

            nk_websocket.ws = websocket;
            nk_websocket.ip = req.socket.remoteAddress;
            nk_websocket.port = req.socket.remotePort;
            nk_websocket.is_server = false;
            nk_websocket.initialized = true;

            websocket.on('message', (data, isBinary) => {
                data = data.toString();
                let num_cli = data.charCodeAt(0);
                let num_serv = data.charCodeAt(1);
                data = data.substring(2);


                if ( num_serv === 0 ) {
                    let sendResponse = function ( msg ) {
                        self.ws.send( String.fromCharCode(num_cli) + String.fromCharCode(num_serv) + msg );
                    }

                    nk_websocket.onMessage( data, sendResponse );
                } else {
                    this.writePromises[num_serv](data);
                    delete this.writePromises[num_serv];
                }

            });
            websocket.on('close', () => {
                nk_websocket.onClose();
            });

            self.onClientConnection( nk_websocket );
        });

    }

    write( msg ) {
        this.ws.send( String.fromCharCode(0) + String.fromCharCode(0) + msg );
    }

    writeAndWait( msg, timeout_ms ) {
        let self = this;
        let num_cli = 0;
        let num_serv = 0;

        for ( let i = 1; i < 255; i++ ) {
            if ( this.writePromises[i] === undefined ) {
                num_serv = i;
                break;
            }
        }

        if ( num_serv === 0 ) {
            return new Promise(function(resolve, reject) {
                reject( "Error, too many writeAndWait" );
            });
        }

        let p = new Promise(function(resolve, reject) {
            self.writePromises[num_serv] = resolve;
            setTimeout( function() { reject( "Timeout" ); }, timeout_ms);
        });

        this.ws.send( String.fromCharCode(num_cli) + String.fromCharCode(num_serv) + msg );

        return p;
    }

    close() {
        this.ws.close();
    }

    isActive() {
        if ( !this.initialized ) return false;
        if ( !this.is_server ) return (this.ws.readyState === 1);
        return (this.server.readyState === 1);
    }

    onClientConnection( nk_websocket ){}
    onOpen( e ) {}
    onMessage( data, sendResponse, e ) {}
    onClose( e ) {}
    onError( e ) {}

    checkPortAvailability( port ) {
        return new Promise((resolve) => {
            const wss = new WebSocketServer.Server({ port: port });
            wss.on('error', (err) => { resolve(false);});
            wss.on('listening', () => { wss.close(); resolve(true); });
            wss.on('close', () => { resolve(false); });
        });
    }
}

class NKWebsocketArray {

    constructor() {
        this.ws_array = [];
    }

    add( nk_websocket ) {
        this.ws_array.push( nk_websocket );
    }

    remove( nk_websocket ) {
        this.ws_array = this.ws_array.filter( nk_ws => nk_ws !== nk_websocket );
    }

    clean() {
        this.ws_array = this.ws_array.filter( nk_ws => nk_ws.isActive() );
    }

    broadcast( msg ) {
        let clean = false;

        for ( let i = 0; i < this.ws_array.length; i++ ) {
            if ( this.ws_array[i].isActive() ) {
                this.ws_array[i].write( msg );
            } else {
                clean = true;
            }
        }

        if ( clean ) this.clean();
    }

}

export { NKWebsocket, NKWebsocketArray };