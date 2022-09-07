const express = require("express");
const http = require("http");
const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} = require("apollo-server-core");

const typeDefs = require("./schemas");
const resolvers = require("./resolvers");
const dataSources = require("./datasources");

async function StartApolloServer() {
  // Required logic for integrating with Express
  const app = express();
  app.get("/status", (req, res) => res.send({ status: "I'm up and running" }));
  // Our httpServer handles incoming requests to our Express app.
  // Below, we tell Apollo Server to "drain" this httpServer,
  // enabling our servers to shut down gracefully.
  const httpServer = http.createServer(app);

  // Same ApolloServer initialization as before, plus the drain plugin
  // for our httpServer.
  let plugins = [ApolloServerPluginDrainHttpServer({ httpServer })];
  if (process.env.NODE_ENV === "production") {
    plugins.concat([
      ApolloServerPluginLandingPageProductionDefault({ embed: true }),
    ]);
  } else {
    plugins.concat([
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ]);
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources,
    csrfPrevention: true,
    cache: "bounded",
    plugins,
  });

  // More required logic for integrating with Express
  await server.start();

  server.applyMiddleware({
    app,

    // By default, apollo-server hosts its GraphQL endpoint at the
    // server root. However, *other* Apollo Server packages host it at
    // /graphql. Optionally provide this to match apollo-server.
    path: "/",
  });

  // Modified server startup
  const port = 4000;
  await new Promise((resolve) => httpServer.listen({ port }, resolve));
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
}

module.exports = StartApolloServer;
