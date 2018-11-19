# sls-ynab-stock-updates

[![Build Status](https://travis-ci.org/brokalys/sls-ynab-stock-updates.svg?branch=master)](https://travis-ci.org/brokalys/sls-ynab-stock-updates)

Serverless function to automatically update investment account balances in YNAB.

## Usage
There are a few preliminary steps that must be taken to start using this serverless function.

## Requirements
- Node
- NPM

## Installation
```sh
npm install
```

## Development
1. Define necessary env variables in `serverless.env.yml` (example available in `serverless.env.example.yml`)

2. Run (to run locally)
```sh
npm start
```

## Deployment
If you wish to run this serverless function on a schedule (configured in `serverless.yml` file), then it must be deployed. This can be done by running the following command.

```sh
npm run deploy
```
