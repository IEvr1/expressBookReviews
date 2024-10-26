const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


// Function to validate the username format
const isValid = (username) => {
    // Define criteria for a valid username
    return typeof username === 'string' && username.trim().length > 0;
};

// Function to check if a user with the given username and password exists
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Login route for registered users
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check for missing fields
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required for login." });
    }

    // Authenticate the user
    if (authenticatedUser(username, password)) {
        // Generate a JWT token with username as payload
        const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });

        // Store token and username in session
        req.session.authorization = { accessToken, username };
        
        return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid login. Check username and password." });
    }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
   const isbn = req.params.isbn;
    const review = req.query.review;

    // Ensure the user is logged in and a review is provided
    if (!req.session.authorization || !review) {
        return res.status(400).json({ message: "User must be logged in and review content is required." });
    }

    // Get the username from the session
    const username = req.session.authorization.username;

    // Check if the book exists
    const book = books[isbn];
    if (book) {
        // Initialize reviews if not already present
        book.reviews = book.reviews || {};

        // Add or update the review for the given username
        book.reviews[username] = review;
        
        return res.status(200).json({ 
            message: "Review added/updated successfully", 
            reviews: book.reviews 
        });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Retrieve the ISBN from request parameters
    const username = req.session.username; // Get the username from the session

    // Check if the user is logged in
    if (!username) {
        return res.status(403).send({ message: 'User not logged in' });
    }

    // Filter and delete the review
    const initialLength = reviews.length; // Store initial length for comparison
    reviews = reviews.filter(review => !(review.isbn === isbn && review.username === username));

    // Check if any review was deleted
    if (reviews.length < initialLength) {
        return res.status(200).send({ message: 'Review deleted successfully' });
    } else {
        return res.status(404).send({ message: 'Review not found or you do not have permission to delete this review' });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
