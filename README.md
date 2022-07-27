# My Wallet

The back-end of a web app to register your financial transactions, both incomings and outgoings. The front-end of this app is at https://github.com/JefersonBatista/my-wallet-frontend.

You can send requests to it in the URL https://jeff-my-wallet.herokuapp.com.

## About

This app includes:

- A basic sign up and login service
- Register and edition of financial transactions, both incomings and outgoings
- The final balance of the transactions

## Next Steps

- Currently, this project has no next steps

## Technologies

The following libraries were used in the construction of the project:

<div>
  <img style='margin: 3px;' src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
  <img style='margin: 3px;' src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
</div>

## How to run

To run this app you need to have a mongo DB server already running, besides a .env file defining an environment variable `MONGO_URI`, to connect to the running DB server, and an environment variable `PORT`, whose value is the port where this app will be listening for requests.

1. Clone this repository
2. Install dependencies

```bash
npm install
```

3. Run the app

```bash
npm run start
```

4. Or run the app in development mode

```bash
npm run dev
```
