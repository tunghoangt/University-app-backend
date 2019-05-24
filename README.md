# Heroku GraphQL and Sequelize Starter

I followed this [tutorial on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs?singlepage=true#define-a-procfile) to create a starter app on Nodejs.

This readme outlines the steps I took to create a simple GraphQL API with Apollo Server and Sequelize hooked up to Heroku's Postgres service.

## Clone Repository

Clone this repository then `cd heroku-graphql-starter`.

## Install Node Dependencies

```bash
$ yarn install
```

## Install Heroku CLI

Instructions for installing the `heroku` CLI tool are [here](https://devcenter.heroku.com/articles/heroku-cli).

## Login to Heroku

Create a Heroku account if you don't have one already. Sign up [here](https://www.heroku.com).

Once you have signed up, use the `heroku` CLI tool to sign in from a terminal.

```bash
heroku login
```

This will launch a browser window. Log into Heroku in the browser and follow instructions from there.

## Create a Heroku App

```bash
heroku apps:create
```

This will create a new app on Heroku and link the git repository in the current directory to a repository on heroku. You can see the remote
by typing the following command:

```bash
$ git remote -v
```

## Define a Procfile

As documented [here](https://devcenter.heroku.com/articles/getting-started-with-nodejs?singlepage=true#define-a-procfile) a Procfile tells Heroku how to launch your app.

Here's what the the `Procfile` for this project looks like:

```
web: yarn serve
webdev: yarn start
```

We'll use the second entry (`webdev`) when running locally. The first (`web`) will be used when running on Heroku.

## Configure Local Database and Run Locally

The Sequelize configuration file in `src/config.json` has three settings for `development`, `test`, and `production`.

> The `db:create` command will fail as it's using my `username`. Change the `username` to yours.

To create, migrate, and seed the development database, do the following:

```bash
# cd into the src directory
$ cd src
# create the dev database
$ npx sequelize db:create

# run migrations
$ npx sequelize db:migrate

# seed the database
$ npx sequelize db:seed:all
```

### Run Locally

We'll use the `heroku local` command to start the development server on `localhost`:

```bash
$ heroku local webdev
```

Note how we're using the `webdev` entry from the `Procfile` to specify how to start the server locally.

## Deploy to Heroku

Commit latest changes (if any) and deploy by pushing the latest commit to the git remote on Heroku.

```bash
$ git push heroku master
```

## Open the App on Heroku

To open your app in a browser do this:

```bash
heroku open
```

This will bring up the GraphQL playground. You should be able to run the `hello` query. But the other operations will fail because we haven't yet configured our app to connect to a hosted Postgres database service on Heroku.

> Horoku might display an error when you try to open the app. This is because
> we haven't yet set up a Postgres database as shown in the following step.

## Add a Postgres Database on Heroku

We're now ready to create a Postgres database on Heroku and configure our app to use it in production.

```bash
$ heroku addons:create heroku-postgresql:hobby-dev
```

This creates a new database and attaches it to our app. You can learn more [here](https://elements.heroku.com/addons/heroku-postgresql).

We're using the free `hobby-dev` database.

When heroku starts a web app, it will assign the URL for the new database to the `DATABASE_URL` environment variable.

If you look at the `Procfile`, you will notice that it references the `DATABASE_URL` environment variable to connect to the database in `production`.

## Run Database Migrations on Production

To run the database migrations on the production database, we'll connect a `bash` shell on Heroku:

```bash
$ heroku run bash
```

This will create a shell on the heroku filesystem where the app is stored.

```bash
# cd to the dist directory (not src/)
$ cd dist
~/dist $ sequelize db:migrate
~/dist $ sequelize db:seed:all
```

## Update App, Re-deploy to Heroku

Let's make a trivial change to the app. For example, change the code in the `hello` query
resolver in `src/index.js` from `world` to `hello world`.

Now commit to git and push the commit to your Heroku repository:

```bash
$ git commit -m 'update hello resolver'
# push code to heroku
$ git push heroku master
```

Wait till the code uploads and the app is restarted. Then try

```bash
$ heroku open
```

Enjoy!
