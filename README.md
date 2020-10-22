# Tyko

Software for managing data on student workplace training. Currently only in finnish.

- [Tyko](#tyko)
  - [Tooling](#tooling)
  - [Services](#services)
    - [API](#api)
    - [Auth](#auth)
    - [Web](#web)
  - [Building & Running](#building--running)

## Tooling

| Name:       | Description:                                     |
| ----------- | ------------------------------------------------ |
| Typescript  | Superset of Javascript with typings added on top |
| Yarn        | Package Manager                                  |
| ESLint      | Javascript Linter                                |
| Prettier    | Code Formatter                                   |
| Commitlint  | Commit message linter                            |
| Husky       | Git Hooks                                        |
| lint-staged | Lint staged files                                |

## Services

| Name: | Info:       |
| ----- | ----------- |
| API   | GraphQL API |
| Auth  | Auth Server |
| Web   | Website     |

### API

API Server

Packages Used:

| Package Name:         | Description:                                  |
| --------------------- | --------------------------------------------- |
| apollo-server-express | GraphQL middleware for Express                |
| class-validator       | Just so there are no peer dependency warnings |
| cors                  | CORS                                          |
| dotenv                | .env file support                             |
| express               | Web server framework                          |
| graphql               | GraphQL Javascript implementation             |
| helmet                | Security Middleware                           |
| http-errors           | HTTP error creation                           |
| jsonwebtoken          | JSON Web Token support                        |
| morgan                | HTTP Logger                                   |
| pg                    | PostgreSQL Driver                             |
| type-graphql          | GraphQL library made for Typescript           |
| typeorm               | Great ORM for Typescript                      |

Development Packages:

| Package Name: | Description:       |
| ------------- | ------------------ |
| node-dev      | NodeJS auto reload |

### Auth

Authentication Server

Packages Used:

| Package Name:                     | Description:                                    |
| --------------------------------- | ----------------------------------------------- |
| @microsoft/microsoft-graph-client | Microsoft Graph API Wrapper                     |
| connect-flash                     | Flash middleware for express                    |
| connect-redis                     | Redis Session Store                             |
| cookie-parser                     | Cookie parsing for express                      |
| cors                              | CORS                                            |
| dotenv                            | .env file support                               |
| express                           | Web server framework                            |
| express-session                   | Session Middleware                              |
| hbs                               | Template Engine                                 |
| helmet                            | Security Middleware                             |
| http-errors                       | HTTP error creation                             |
| jsonwebtoken                      | JSON Web Token support                          |
| morgan                            | HTTP Logger                                     |
| node-fetch                        | Fetch API on NodeJS                             |
| passport                          | Authentication Middleware                       |
| passport-azure-ad                 | Microsoft Authtentication provider for passport |
| pg                                | PostgreSQL Driver                               |
| redis                             | Redis Client                                    |
| simple-oauth2                     | Simple OAuth2 token management                  |
| typeorm                           | Great ORM for Typescript                        |

Development Packages:

| Package Name: | Description:       |
| ------------- | ------------------ |
| node-dev      | NodeJS auto reload |

### Web

Frontend

Packages Used:

| Package Name:        | Description:                         |
| -------------------- | ------------------------------------ |
| @apollo/client       | Quickstart for Apollo Client         |
| @date-io/moment      | Moment.js Abstraction Layer          |
| @hapi/iron           | Token Encapsulation                  |
| @material-ui/core    | Material Design components for React |
| @material-ui/icons   | Material Design icons for React      |
| @material-ui/pickers | Material Design Date & Time Pickers  |
| cookie               | cookie parsing utility               |
| formik               | Form Library                         |
| graphql              | GraphQL Javascript implementation    |
| material-table       | Material Design table                |
| moment               | Date Manipulation                    |
| next                 | React Framework                      |
| react                | UI Library                           |
| react-dom            | React mappings for Web               |

Development Packages:

| Package Name:                            | Description:                                     |
| ---------------------------------------- | ------------------------------------------------ |
| @graphql-codegen/cli                     | GraphQL Code Generator                           |
| @graphql-codegen/typescript              | Typescript support for graphql-codegen           |
| @graphql-codegen/typescript-operators    | More Typescript support for graphql-codegen      |
| @graphql-codegen/typescript-react-apollo | React Apollo Code Generation for graphql-codegen |
| env-cmd                                  | .env file loading                                |
| graphql-let                              | Automatic graphql-codegen                        |

## Building & Running

TODO
