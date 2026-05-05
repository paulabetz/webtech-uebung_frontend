# Webtech-Übung Frontend: Flashcard Web Application

## Description
This project is the frontend for a simple flashcard web application.
It provides a user interface to view, create, and manage flashcard decks and their cards.

## Purpose
The application is designed as a learning tool for students to practice
with question-and-answer cards. It communicates with the backend REST API
to manage flashcard data.

## Technologies
Vue 3, TypeScript, Vite

## Features
- View all flashcard decks
- See how many cards each deck contains
- Navigate between decks
- Create, delete, and learn cards 

## Data Model

### Card
A card contains a question and an answer.
It can also include a field to mark whether the card has been learned.

### Deck
A deck is a collection of cards with a name and a unique ID.

## How to Run
Start the development server with:
```bash
npm run dev
```
The app is available at: `http://localhost:5173/`

## API Connection
The frontend communicates with the backend REST API (Spring Boot) running separately.
Make sure the backend is started before using the full application.

## Purpose of the Project
The project is part of a Web Technologies course. The goal is to gradually
develop a web application throughout the course and ultimately create a
complete website by the end.
