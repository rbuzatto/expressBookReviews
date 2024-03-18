const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooks = () => new Promise((resolve, _reject) => {
  setTimeout(() => {
    resolve(books);
  }, 200);
});

const getFilterBooksBy = (key) => async (value) => {
  try {
    let fetchedbooks = {};
    const books = await getBooks();
    const bookIds = Object.keys(books);

    bookIds.forEach((id) => {
      if(books[id][key] === value) {
        fetchedbooks[id] = books[id];
      }
    })

    return fetchedbooks;
  } catch (error) {
    throw new Error(error);
  }
}
const getFilterBooksByAuthor = getFilterBooksBy('author');
const getFilterBooksByTitle = getFilterBooksBy('title');
const formatResponse = (data) => JSON.stringify(data, null, 4);

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (isValid(username)) {
      users.push({ username, password });
      res.send("user is sucessfully registered");
    } else {
      res.send("user already exists");
    }
  } else {
    res.send("username or password invalid format");
    return false;
  }
});

// Get the book list available in the shop
public_users.get('/',async (_req, res) => {
  try {
    const fetchedbooks = await getBooks();
    return res.send(formatResponse(fetchedbooks));
  } catch (error) {
    res.status(404).send("Books not found");
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async (req, res) => {
  try {
    const fetchedbooks = await getBooks();
    return res.send(formatResponse(fetchedbooks[req.params.isbn]));

  } catch (error) {
    res.status(404).send("Book not found");
  }
 });

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const fetchedbooks = await getFilterBooksByAuthor(req.params.author);
    return res.send(formatResponse(fetchedbooks));

  } catch (error) {
    res.status(404).send("Book not found");
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
  const fetchedbooks = await getFilterBooksByTitle(req.params.title);
  return res.send(formatResponse(fetchedbooks));

  } catch (error) {
    res.status(404).send("Book not found");
  }
});

//  Get book review
public_users.get('/review/:isbn',async (req, res) => {
  try {
    const fetchedbooks = await getBooks();
    return res.send(formatResponse(fetchedbooks[req.params.isbn].reviews));

  } catch (error) {
    res.status(404).send("Book not found");
  }
});

module.exports.general = public_users;
