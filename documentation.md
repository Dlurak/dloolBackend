# Dlool API Documentation

Dlools API is RESTful API.

I plan to change to Swagger in the future, this is just a temporary solution.

## Authentication

For the sake of simplicity the documentation says `/user` but `/users` with an `s` is also valid.

### Register

`POST /user/register`

**Request**

```json
{
    "username": "username",
    "name": "name",
    "password": "password",
    "school": "School",
    "class": "1A"
}
```

The `name` is the shown name of the user in the class. `Username` is the _real_ username it must be unique. The `password` should be clear text and will be hashed on the server.

As for right now the password is not checked for security, but it will be in the near future.
It is important to note that the school and class must be already created. If not the request will fail with a `400` error.

**Response**

```json
{
    "status": "success",
    "message": "User created"
}
```

### Login

Dlool uses JWT for authentication. The token is valid for 1 hour.

`POST /user/login`

**Request**

```json
{
    "username": "username",
    "password": "password"
}
```

**Response**

```json
{
    "status": "success",
    "message": "Login successful",
    "token": "jwt-token"
}
```

## Schools

Again for simplicity the documentation says `/school` but `/schools` with an `s` is also valid.

### Create a new school

`POST /school`

```json
{
    "name": "School",
    "description": "This school does not exist it is only for testing purposes",
    "uniqueName": "school",
    "timezoneOffset": 0
}
```

**Response**

## Classes

Again for simplicity the documentation says `/class` but `/classes` with an `es` is also valid.

### Create a new class

**Request**

```json
{
    "name": "1A",
    "school": "school"
}
```

The `school` must be the `uniquename` of the school.

## Homework

### Create a new homework

```json
{
    "className": "class",
    "from": {
        "year": 2019,
        "month": 1,
        "day": 1
    },
    "assignments": [
        {
            "subject": "Math",
            "description": "Excersise 1.1",
            "due": {
                "month": 1,
                "year": 2019,
                "day": 2
            }
        }
    ]
}
```

You can put it as many assignents as you want in the `assignments` array.
The `className` muste be the name of a class the user is in.
