# NKWebsocket

## Usage

    import {NKWebsocket, NKWebsocketArray} from 'nklibs-node';

Examples
----------------------------------------------------------------------------

    import {NKWebsocket, NKWebsocketArray} from 'nklibs-node';
    
    let server = new NKWebsocket();
    let clients = new NKWebsocketArray();
    
    server.onClientConnection = function ( nk_websocket, req ) {
        clients.add( nk_websocket );
    
        console.log("New client.");
        console.log(nk_websocket.ip, nk_websocket.port);
    
        nk_websocket.onMessage = function( e ) {
            console.log("onMessage: %s", e );
        }
        nk_websocket.onClose = function( e ) {
            console.log("onClose", e );
        }
        nk_websocket.onError = function( e ) {
            console.log("onError", e );
        }
    }
    
    server.listen('localhost', 1234 );
