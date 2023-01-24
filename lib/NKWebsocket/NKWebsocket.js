import { WebSocketServer } from 'ws';

class NKWebsocket {


    constructor() {
        this.initialized = false;
        this.is_server = true;
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
                let num = data.charCodeAt(0);
                data = data.substring(1);
                nk_websocket.onMessage( data, num );
            });
            websocket.on('close', () => {
                nk_websocket.onClose();
            });

            self.onClientConnection( nk_websocket );
        });

    }

    write( msg, num = 0 ) {
        this.ws.send( String.fromCharCode(num) + msg );
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
    onMessage( e ) {}
    onClose( e ) {}
    onError( e ) {}
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