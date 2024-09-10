const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

const users = []; // Array to store users

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/views/index.html");
});

// Create a new user
app.post("/api/users", (req, res) => {
	const { username } = req.body;
	if (!username) {
		return res.status(400).json({ error: "Username is required" });
	}
	const newUser = { username, _id: uuidv4(), log: [] };
	users.push(newUser);
	res.json({ username: newUser.username, _id: newUser._id });
});

// Get all users
app.get("/api/users", (req, res) => {
	res.json(users.map((user) => ({ username: user.username, _id: user._id })));
});

// Add an exercise for a user
app.post("/api/users/:_id/exercises", (req, res) => {
	const { _id } = req.params;
	const { description, duration, date } = req.body;
	const user = users.find((user) => user._id === _id);

	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}

	const exercise = {
		description,
		duration: parseInt(duration),
		date: date ? new Date(date).toDateString() : new Date().toDateString(),
	};

	user.log.push(exercise);
	res.json({
		username: user.username,
		description: exercise.description,
		duration: exercise.duration,
		date: exercise.date,
		_id: user._id,
	});
});

// Get a user's exercise log
app.get("/api/users/:_id/logs", (req, res) => {
	const { _id } = req.params;
	const { from, to, limit } = req.query;
	const user = users.find((user) => user._id === _id);

	if (!user) {
		return res.status(404).json({ error: "User not found" });
	}

	let log = user.log;

	// Apply date filters if provided
	if (from) {
		const fromDate = new Date(from);
		log = log.filter((exercise) => new Date(exercise.date) >= fromDate);
	}

	if (to) {
		const toDate = new Date(to);
		log = log.filter((exercise) => new Date(exercise.date) <= toDate);
	}

	// Apply limit if provided
	if (limit) {
		log = log.slice(0, parseInt(limit));
	}

	res.json({
		username: user.username,
		_id: user._id,
		count: log.length,
		log,
	});
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});
