const hapi = require('hapi');
const mongoose = require('mongoose');
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi');
const Painting = require('./models/painting');
const schema = require('./graphql/schema');

const server = hapi.server({
  port: 4000,
  host: 'localhost'
});

const init = async () => {
  server.route([
    {
      method: 'GET',
      path: '/',
      handler: (req, res) => '<h1>Bright new API</h1>'
    },
    {
      method: 'GET',
      path: '/api/v1/paintings',
      handler: (req, res) => Painting.find()
    },
    {
      method: 'POST',
      path: '/api/v1/paintings',
      handler: (req, res) => {
        const { name, url, technique } = req.payload;
        const painting = new Painting({ name, url, technique });

        return painting.save();
      }
    },
  ]);

  await server.register({
    plugin: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: {
        endpointURL: '/graphql'
      },
      route: {
        cors: true
      }
    }
  });

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: {
        schema
      },
      route: {
        cors: true
      }
    }
  });

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);

  mongoose.connect('mongodb://localhost/hapi-graphql');
  mongoose.connection.once('open', () => console.log('connected to DB'))
}

init();
