# Herman

A somewhat-scrappy moderation bot that becomes increasingly redundant with every Discord update.

# Usage
## Installation

Clone the repository: `git clone https://github.com/TheBorinator/Herman`

Enter the directory: `cd Herman`

Install the required packages: `npm i`

## Environment variables

`DISCORD_TOKEN` The token you generate when creating an application at [discord.com](https://discord.com/developers/applications)

`CLIENT_ID` The application ID you generated when you created your application

`DATABASE_URL` The URL of your database

`OTP_SECRET` A secret string used for triggering cache clearance between the web client and the Discord client

## Prisma setup

Run `prisma db push` once you have set the correct database URL.

## Running Herman

Run `npm run dev` to start Herman
