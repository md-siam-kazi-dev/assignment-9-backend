# PawNest API

Backend API for PawNest, a pet adoption platform.

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Better Auth (JWT Verification)
* JOSE
* CORS

## Installation

```bash
git clone <repository-url>
cd pawnest-api
npm install
```

## Environment Variables

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
```

## Run Locally

```bash
npm start
```

Server runs on:

```text
http://localhost:5000
```

---

## Authentication

Protected routes require a JWT token.

```http
Authorization: Bearer <token>
```

---

# API Endpoints

## Health Check

### GET /

Check server status.

#### Response

```json
[
  {
    "msg": "your api is working"
  }
]
```

---

## Pets

### GET /allpets

Get all pets.

#### Query Parameters

| Parameter | Type   | Description        |
| --------- | ------ | ------------------ |
| search    | string | Search by pet name |

#### Example

```http
GET /allpets?search=dog
```

---

### GET /6pets

Get first 6 pets.

#### Response

```json
[
  {
    "_id": "...",
    "petName": "Max"
  }
]
```

---

### GET /:id

Get pet details by ID.

**Protected Route**

#### Headers

```http
Authorization: Bearer <token>
```

---

### GET /user/:email

Get all pets listed by a user.

#### Example

```http
GET /user/user@example.com
```

---

### POST /addpet

Create a new pet listing.

**Protected Route**

#### Headers

```http
Authorization: Bearer <token>
```

#### Request Body

```json
{
  "petName": "Max",
  "species": "Dog",
  "breed": "Golden Retriever",
  "ageValue": "2",
  "ageUnit": "years",
  "gender": "Male",
  "imageUrl": "image-url",
  "healthStatus": "Good",
  "isVaccinated": "on",
  "vaccines": "Rabies,Distemper",
  "city": "Dhaka",
  "state": "Dhaka",
  "country": "Bangladesh",
  "adoptionFee": 100,
  "description": "Friendly dog",
  "ownerEmail": "owner@example.com"
}
```

---

### PUT /addpet

Update an existing pet.

#### Request Body

```json
{
  "_id": "pet-id",
  "petName": "Updated Name"
}
```

---

### DELETE /addpet/:id

Delete a pet and all related adoption requests.

#### Example

```http
DELETE /addpet/6845d1f23abc123
```

---

### DELETE /pet/:id

Delete a pet.

#### Example

```http
DELETE /pet/6845d1f23abc123
```

---

## Adoption Requests

### GET /pet/req

Get all adoption requests.

**Protected Route**

#### Headers

```http
Authorization: Bearer <token>
```

---

### POST /pet/req

Create an adoption request.

#### Request Body

```json
{
  "user": {
    "name": "John",
    "email": "john@example.com"
  },
  "pet": {
    "_id": "pet-id",
    "petName": "Max"
  }
}
```

#### Response

```json
{
  "requested": "Already Requested"
}
```

or

```json
{
  "acknowledged": true
}
```

---

### PATCH /pet/req/:status/:id

Update adoption request status.

#### Parameters

| Parameter | Description                 |
| --------- | --------------------------- |
| status    | pending, accepted, rejected |
| id        | Pet ID                      |

#### Example

```http
PATCH /pet/req/accepted/6845d1f23abc123
```

When status is `accepted`, the pet's `isAdopted` field is automatically updated to `true`.

---

### DELETE /pet/req/:id

Delete adoption request by pet ID.

#### Example

```http
DELETE /pet/req/6845d1f23abc123
```

---

## Database Collections

### pet

Stores pet listings.

### petreq

Stores adoption requests.

---

## Project Structure

```text
.
├── server.js
├── .env
├── package.json
└── node_modules
```


