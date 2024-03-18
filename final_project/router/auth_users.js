const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return !users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{
  return users.some((user) => (user.username === username && user.password === password));
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

 if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = { accessToken, username };

  return res.status(200).send("User successfully logged in");
  }

  return res.status(208).json({message: "Invalid Login. Check username and password"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const reviews = book.reviews;
  const user = req.session.authorization.username;
  reviews[user] = req.body.review;
  console.log('reviews', reviews)
  return res.status(201).json({message: "Review added successfully"});
});

// Remove a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const user = req.session.authorization.username;
  delete book.reviews[user];

  return res.status(200).json({message: "Review deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
