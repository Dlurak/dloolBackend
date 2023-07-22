# Dlool API Documentation

Dlools API is RESTful API.

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

**Response**

```json
{
    "status": "success",
    "message": "User created"
}
```
