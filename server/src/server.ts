import express from 'express'

const app = express();

app.get('/users', (request, response) => {
    console.log('Listagem de USuários');
    response.json([
       'dsada',
       'dsadagb',
       'dsadafds' 
    ])
});

app.listen(3333)