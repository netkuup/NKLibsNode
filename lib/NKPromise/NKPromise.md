# NKPromise

## Usage

    import {NKPromise} from 'nklibs-node';

## Examples
Convert async code to sync

    import {NKPromise} from 'nklibs-node';
    
    function wait5seconds() {
        let p = new NKPromise();
    
        setTimeout(function() {
    
            p.resolve("Hello world");
            //p.reject("Error");
    
        }, 5000);
    
        return p;
    }
    
    
    console.log("Waiting 5 seconds...");
    
    let foo = await wait5seconds();
    
    console.log("Done.");
    console.log( foo );


Output

    Waiting 5 seconds...
    Done.                     // After 5 seconds
    Hello world
