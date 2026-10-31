const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Register new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  } else {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const booksByAuthor = [];

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author) {
      booksByAuthor.push({
        isbn: isbn,
        title: books[isbn].title,
        reviews: books[isbn].reviews
      });
    }
  });

  if (booksByAuthor.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor: booksByAuthor }, null, 4));
  } else {
    return res.status(404).json({ message: "No books found for author " + req.params.author });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const booksByTitle = [];

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title) {
      booksByTitle.push({
        isbn: isbn,
        author: books[isbn].author,
        reviews: books[isbn].reviews
      });
    }
  });

  if (booksByTitle.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle: booksByTitle }, null, 4));
  } else {
    return res.status(404).json({ message: "No books found with title " + req.params.title });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }
});

/* ------------------------------------------------------------------
   Task 11: Axios with async/await
   ------------------------------------------------------------------ */

// Get all books using async/await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// Get book details based on ISBN using async/await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(req.params.isbn)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: "Error fetching book by ISBN", error: error.message });
  }
});

// Get book details based on author using async/await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Get book details based on title using async/await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: "Error fetching books by title", error: error.message });
  }
});

module.exports.general = public_users;