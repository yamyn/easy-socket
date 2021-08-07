# easy-socket

![onix](https://img.shields.io/badge/onix-systems-blue.svg)

Library for easy use of socket.io with MVC pattern

# Install

```sh
npm i easy-socket
```

# API

-   [gateway](#gateway-1)

    -   [create](#creategateway)
    -   [use](#usegateway)
    -   [emit](#emitevent)

-   [listeners](#listeners-1)

    -   [create](#createlisteners)
    -   [use](#uselisteners)

-   [emiteds](#emiteds-1)

    -   [create](#createemiteds)
    -   [use](#useemiteds)
    -   [listen](#listenevent)

-   [auth](#auth-1)

    -   [create](#createvalidationschema)
    -   [use](#usevalidation)
    -   [catcherrorinclient](#catcherrorinclient-1)

-   [validation](#validation-1)

    -   [create](#createvalidationschema)
    -   [use](#usevalidation)
    -   [catcherrorinclient](#catcherrorinclient-1)


-   [interceptor](#interceptor-1)

    -   [create](#createcustominterceptor) 

-   [uploadfiles](#uploadfiles-1)

    -   [add](#adduploadlistener) 
    -   [use](#useuploadlistener) 
    -   [serveclient](#serveclientuploader)
    -   [onclient](#onclient)  

# Examples

## Require module

```javascript
// ./main.js
const io = require('socket.io');
const http = require('http');
const { Socket } = require('easy-socket');

Socket.init(io(http.createServer()), options);
```

| Param               | Type                       | Description                                      | Required  |
| ------------------- | -------------------        | ---------------------------------------          | --------  |
| Server              | <code>Socket server</code> | Socket io instance                               | true      |
| options             | <code>Object</code>        |                                                  | false     |
| params.interceptor  | <code>Function</code>      | Transform the exception thrown from a function   | false     |
| params.auth         | <code>Function</code>      | Middleware for authenticate client               | false     |

<br>

## gateway

### create gateway

```javascript
// ./modules/test/test.gateway.js

const { Gateway } = require('easy-socket');

const TestGateway = new Gateway('test');

TestGateway.addListener('hello', (ctx, data) => { return 'Hello world!' });

```

### use gateway

```javascript
// ./main.js
const io = require('socket.io');
const http = require('http');
const { Socket } = require('easy-socket');

const TestGateway = require('./modules/test/test.gateway.js');

Socket.use(TestGateway);

Socket.init(io(http.createServer()), options);
```

### emit event

```javascript
// client.html
  socket.on('connect', () => {
    scoket.emit('test/hello', {}, ({ data, error }) => {
      if(error) {
        console.error(error)
      }
  
      console.log(data) // Hello world
    });
  }
```


## listeners

### create listeners

```javascript
// ./modules/test/test.listeners.js

class TestListeners {
    myFirstListener(ctx, data) {
        console.log('socket.io server :>> ', ctx.server);
        console.log('client socket :>> ', ctx.socket);
      
        return 'Hello world!';
    }
}

module.exports = new TestListeners();
```

### use listeners

```javascript
// ./modules/test/test.gateway.js

const { Gateway } = require('easy-socket');
const TestListeners = require('./test.listeners');

const TestGateway = new Gateway('test');

TestGateway.addListener('hello', TestListeners.myFirstListener);

```

## emiteds

### create emiteds

```javascript
// ./modules/test/test.emiteds.js

const { Emiteds } = require('easy-socket');

class TestEmiteds extends Emiteds {
    sendMyFirstEvent(ctx, message) {
        this.emit(ctx.socket, 'test-event', {
            data: message,
        });
    }
}

module.exports = new TestEmiteds('test');
```

### use emiteds

```javascript
// ./modules/test/test.listeners.js

const TestEmiteds = require('./test.emiteds');

class TestListeners {
    myFirstListener(ctx, data) {
        TestEmiteds.sendMyFirstEvent(ctx, 'Hi client!')
      
        return 'Hello world!';
    }
}

module.exports = new TestListeners();
```

### listen emit

```javascript
// client.html
  socket.on('connect', () => {
    socket.on('test/test-event', ({ data }) => {
      console.log(data) // Hi client!
    });
    
    scoket.emit('test/hello', {}, ({ data, error }) => {
      if(error) {
        console.error(error)
      }
  
      console.log(data) // Hello world
    });
  }
```

## validation

### create validation schema

```javascript
// ./modules/test/test.validations.js

const { Validator } = require('easy-socket');

const schema = Validator.createSchema(Joi => {
    return {
        username: Joi.string().alphanum().min(3).max(30).required(),
        birth_year: Joi.number().integer().min(1900).max(2013),
    };
});

module.exports = {
    myFirstValidationSchema: schema,
};

```

### use validation

```javascript
// ./modules/test/test.gateway.js

const { Gateway } = require('easy-socket');
const TestListeners = require('./test.listeners');
const { myFirstValidationSchema } = require('./test.validations');

const TestGateway = new Gateway('test');

TestGateway.addListener('hello', TestListeners.myFirstListener)
           .validate(myFirstValidationSchema);
           
```

### catch error in client

```javascript
// client.html
  socket.on('connect', () => {
    scoket.emit('test/hello', {}, ({ data, error }) => {
      console.error(error) // { message: "Error message", statusCode: 400, name: "Bad Request" }
    });
  }
```

## auth

### set auth middleware and protect gateway

```javascript
// ./main.js
// example with jwt

const io = require('socket.io');
const http = require('http');
const { Socket } = require('easy-socket');
const jwt = require('jwt');

const TestGateway = require('./modules/test/test.gateway.js');

Socket.use(TestGateway, { protected:true });

Socket.init(io(http.createServer()), {
    auth: socket => {
        const { token } = socket.handshake.auth;

        if (token) {
            try {
                const payload = jwt.verify(
                    token.split('Bearer ')[1],
                    'jwt secret key',
                );

                return { user: payload };
            } catch (error) {
                return { error };
            }
        }

        return { error: new Error('Access token not exist!') };
    },
});
```

### on client

```javascript
// client.html
    const socket = io('http://localhost:3000', {
       auth: {
               token: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6eyJ1c2VyX2lkIjoyNSwiZnVsbF9uYW1lIjoiTGlvbHlrIn0sImlhdCI6MTYyNzU0NTE1NH0.thTscgsv0Rr8MZlNugVzaA7Dd7w_UZswXhgiyyRXWbs`,
              }
            });

  socket.on('connect', () => {
    socket.on('common/on-auth-error', ({error}) => {
        console.log('on-auth-error :>> ');
        console.log(error);
     });
                
    socket.emit('test/hello', {}, ({ data, error }) => {
      console.error(error) // { message: "Error message", statusCode: 400, name: "Bad Request" }
    });
  }
```

## interceptor

### create custom interceptor

```javascript
// ./main.js

const io = require('socket.io');
const http = require('http');
const { Socket, exceptions: { Exception } } = require('easy-socket');

const TestGateway = require('./modules/test/test.gateway.js');

Socket.use(TestGateway);

Socket.init(io(http.createServer()), {
    interceptor: (error, cb) => {
      if (!error.statusCode || error.statusCode === 500) {
          console.log(error);

          return cb({
              error: new Exception(error.message, 500),
          });
      }

      cb({ error });
  }
});
```

## upload files

### add upload listener

```javascript
// ./modules/test/test.listeners.js

class TestListeners {
    myFirstListener(ctx, data) {
        console.log('socket.io server :>> ', ctx.server);
        console.log('client socket :>> ', ctx.socket);
      
        return 'Hello world!';
    }
    
    uploadImage(ctx, file) {
      console.log('file :>> ', file);
      }
}

module.exports = new TestListeners();
```

### use upload listener

```javascript
// ./modules/test/test.gateway.js

const { Gateway } = require('easy-socket');
const TestListeners = require('./test.listeners');

const TestGateway = new Gateway('test');

TestGateway.addListener('hello', TestListeners.myFirstListener);

TestGateway.addFileListener('image', TestRoomListeners.uploadImage);

```

### serve client uploader

```javascript
// ./main.js

const io = require('socket.io');
const http = require('http');
const { Socket, Uploader } = require('easy-socket');

const TestGateway = require('./modules/test/test.gateway.js');

const server = http.createServer();

// add route /siofu/client.js on server
Uploader.serveClient(server)

Socket.use(TestGateway);

Socket.init(io(server));
```

### on client


```javascript
// client.html
  <form id="form">
      <input type="file" name="file" />
      <button type="submit">Sent</button>
  </form>
 <script src="http://localhost:3000/siofu/client.js">
      const socket = io('http://localhost:3000');
      
      const uploader = new SocketIOFileUpload(socket);
      
      const setImageTypeListener = function (event) {
        event.file.meta.type = 'image';
      };

      socket.on('connect', () => {
        form.addEventListener('submit', e => {
          event.preventDefault();
          
          uploader.addEventListener('start', setImageTypeListener);
          
          uploader.submitFiles(e.target.file.files);
          
          uploader.removeEventListener('start', setImageTypeListener);
        });
        
        socket.on('common/on-auth-error', ({error}) => {
            console.log('on-auth-error :>> ');
            console.log(error);
         });

        socket.emit('test/hello', {}, ({ data, error }) => {
          console.error(error) // { message: "Error message", statusCode: 400, name: "Bad Request" }
        });
      }
</script>
```
