require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

morgan.token('type', function(req, res) {
  return req.method === 'POST' ? JSON.stringify(req.body) : undefined;
});

// app.use(morgan('tiny'))
// app.use(morgan('type'))

app.use(morgan('tiny'));
app.use(morgan(':type'));
app.use(express.json());
app.use(cors());
app.use(express.static('build'));

const persons = [
  {
    'name': 'Arto Hellas',
    'number': '040-123456',
    'id': 1,
  },
  {
    'name': 'Ada Lovelace',
    'number': '39-44-5323523',
    'id': 2,
  },
  {
    'name': 'Dan Abramov',
    'number': '12-43-234345',
    'id': 3,
  },
  {
    'name': 'Mary Poppendick',
    'number': '39-23-6423122',
    'id': 4,
  },
];

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
      .then((person) => {
        response.json(person);
      })
      .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
      .then((result) => {
        response.status(204).end();
      })
      .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({error: 'content missing'});
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
      .then((savedPerson) => {
        response.json(savedPerson);
      })
      .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
      .then((updatedPerson) => {
        response.json(updatedPerson);
      })
      .catch((error) => next(error));
});

app.get('/info', (req, res) => {
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed);

  res.send(
      `Phonebook has info for ${persons.length} people.
    <br/>
    ${today.toISOString()}
    `);
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  console.error(`Oma virhe : ${error.name}`);

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'});
  } else if (error.name === 'ValidationError') {
    console.error(`Validointivirhe`);
    return response.status(400).json({error: error.message});
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
