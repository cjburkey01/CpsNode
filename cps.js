'use strict';

console.log('Loading...')

// Require and instantiate the Koa library
const Koa = require('koa');
const app = new Koa();

// Allow funny business
const mount = require('koa-mount');

// Static file serving, such as the resources directory
const serve = require('koa-static');

// Routing with Koa
const route = require('koa-route');

// Read files
const fs = require('fs');

// Require pug, the format of webpage I've chosen to write.
// It's compiled into HTML via Middleware
// See: https://pugjs.org
const pug = require('js-koa-pug');

// data.json IS NOT SHIPPED IN THE REPO!
// It must have these keys:
/*
    {
        "apiKey": "<API_KEY_HERE>",
        "orgId": 1179
    }
*/
// The Cabarrus Pets Society RescueGroups Organization ID is 1179
// The API key is requested from RescueGroups
const config = JSON.parse(fs.readFileSync('data.json'));

// Requests to API
const api = (new require('./module/cps_api.js'))(config);

// This should probably stay 80, but it can depend on the host
const port = 80;

// Middleware
app.use(pug('views'));

// Routes
app.use(mount('/static', serve('static')));
staticRender('/', 'index');
staticRender('/dogs', 'dogs');

// API Routes
app.use(route.get('/api/dog_list/:perPage/:page', async (ctx, perPage, page) => {
    let data = await processSearch(perPage, page, [
        'animalName',
        'animalStatus',
        'animalBirthdate',
        'animalPictures',
    ], [
        {
            fieldName: 'animalStatus',
            operation: 'equals',
            criteria: 'Available',
        },
    ]);
    ctx.body = data;
}));
app.use(route.get('/api/dog_data/:id', async (ctx, id) => {
    let data = await processSearch(perPage, page, [
        'animalName',
        'animalStatus',
        'animalBirthdate',
        'animalPictures',
    ], [
        {
            fieldName: 'animalStatus',
            operation: 'equals',
            criteria: 'Available',
        },
    ]);
    ctx.body = data;
}));

async function processSearch(perPage, currentPage, results, filters) {
    let resp = await api.searchCps(perPage, currentPage, results, filters);
    
    // TERNARY MADNESS!
    let dat = (resp == null) ? null : resp.data;
    dat.error = ((dat != null && dat.status == 'ok')
        ? null
        : ((dat != null
            && dat.messages != null
            && dat.messages.generalMessages != null
            && dat.messages.generalMessages.length > 0)
                ? (dat.messages.generalMessages[0].messageText)
                : 'An error occurred'));
    
    return dat;
}

// Open the server
app.listen(port);
console.log(`Opened server on port ${port}`);

function staticRender(at, view) {
    app.use(route.get(at, async ctx => ctx.render(view)));
}
