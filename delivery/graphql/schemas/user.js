const { gql } = require("apollo-server-express");
const typeDef = gql`
  extend type Query {
    users(page: Int): [User]
  }
  extend type Mutation {
    register(input: InputUser): User
  }

  # User type defines the queryable fields for every user in our data source.
  type User {
    name: String
    fullName: String
  }

  input InputUser {
    name: String
    fullName: String
  }
`;
module.exports = typeDef;
