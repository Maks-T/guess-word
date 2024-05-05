/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */

function initFastify() {
    const path = require('path');

// Require the fastify framework and instantiate it
    const fastify = require('fastify')({
        // Set this to true for detailed logging:
        logger: false,
    });

    const {generateId} = require('./helpers/index.js');

    fastify.register(require('@fastify/cookie'), {decodeValues: true});

    fastify.register(require('fastify-socket.io'), {});


// Setup our static files

    fastify.register(require('@fastify/static'), {
        root: path.join(__dirname, '../../public'),
        prefix: '/', // optional: default '/'
    });

// Formbody lets us parse incoming forms
    fastify.register(require('@fastify/formbody'));

// View is a templating manager for fastify
    fastify.register(require('@fastify/view'), {
        engine: {
            handlebars: require('handlebars'),
        },
        includeViewExtension: true, // add this line to include view extension
        templates: './src/pages', // set templates folder
    });

    return fastify;
}

module.exports = {initFastify};
