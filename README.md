# Dlool - Digital Homework Book

**This is currently undergoing a complete rewrite, please see [this repository](https://github.com/Dlurak/dlool_backend_v2)**

Dlool is the digital version of a homework book.

---

Classical homework books have many problems.
A lot of people who use tablets in school do not have notebooks but a homework book is still needed.
Here are some problems they have and how Dlool solves them:

| Problem                                    | Solution                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| Everyone in a class writes down the same   | Dlool is collaborative, all entries from one class are available in one class. |
| They are not very good for the environment | Dlool is digital, no paper is needed.                                          |
| They are not very practical                | Dlool is available on all devices.                                             |
| Entries are not very structured            | Dlool has a structured entry system.                                           |
| When you lose your homework book           | Dlool is digital, you can't lose it.                                           |
| Every year you need a new homework book    | Dlool can be used for multiple years.                                          |

---

## Installation

1. Clone this repository
    ```bash
     git clone git@github.com:Dlurak/dloolBackend.git
    ```
2. Install the dependencies
    ```bash
     npm install
    ```
3. Create a `.env` file in the root directory of the project
    ```bash
    touch .env
    ```
4. Add the following variables to the `.env` file

    1. `Mongo_URI`=String to the Cluster `<username>`, `<password>` and `<dbname>` can be replaced automatically, e.g. `mongodb+srv://<username>:<password>@<dbname>.ljdmejo.mongodb.net/?retryWrites=true&w=majority`
    2. `MONGO_PASSWORD`=Password for the database
    3. `MONGO_USERNAME`=Username for the database
    4. `MONGO_DBNAME`=Name of the database
    5. `JWT_SECRET`=Secret for the JWT, just a random string

    If you want to run tests, the test database needs to be droppable, so you need to add a new user on MongoDB with permission to drop the database. On Atlas it is the highest permission level. You will need to add the following variables to the `.env` file:

    1. `MONGO_USERNAME_TEST`=Username for the newly created user
    2. `MONGO_PASSWORD_TEST`=Password for the new user

## Usage

1. Compile the TypeScript code
    ```bash
    npm run build
    ```
2. Start the server
    ```bash
    npm run start
    ```
3. The server is now running on [localhost port 3000](http://localhost:3000/)

### Documentation

1. Compile the TypeScript code
    ```bash
    npm run build
    ```
2. Create the static documentation HTML files
    ```bash
    npm run document
    ```
3. Start the documentation server
    ```bash
    npm run serve:docs
    ```
4. The server is now running on [localhost port 3001](http://localhost:3001)

## Thanks

I want to thank [the contributors of that repo](https://github.com/dmfilipenko/timezones.json/blob/master/timezones.json).
