# MemoryHole

## Prerequisites

- Database :<br>
Currently, TypeOrm is configured to connect to a **MariaDB** database.<br>
If you have **Docker**, a `.yml` file is provided to pull a MariaDB image.<br>
If you don't have MariaDB or Docker you can still modify the configurations in the `ormConfig.ts` file, but please don't commit these modifications.

- NodeJS :<br>
Minimum recommended version: 6.0<br>
Recommended version: 14.15.1


## Installation

- Copy the `.env.example` file to a `.env` file and fill it with the desired configurations.

- Install dependencies with `npm install`

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production
$ npm run build
$ npm run start:prod
```
