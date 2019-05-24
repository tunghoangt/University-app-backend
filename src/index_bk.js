import {
  ApolloServer,
  gql,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server';

import db from './models';

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
    todos: [Todo]
  }

  type Mutation {
    createTodo(name: String): Todo
  }

  type Todo {
    id: ID!
    name: String!
    done: Boolean!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hello world',
    todos: (root, args, context, info) => db.Todo.findAll(),
  },
  Mutation: {
    createTodo: (root, args, context, info) => {
      return db.Todo.create({ name: args.name, done: false });
    },
  },
};

const server = new ApolloServer({
  cors: false,
  typeDefs,
  resolvers,
  context: request => {
    return request;
  },
  // enable playground even in production
  introspection: true,
  playground: true,
});

const PORT = process.env.PORT || 4000;

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
