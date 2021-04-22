const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');
const Movie = require('../models/movie');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.status(200).send(movies))
    .catch(next);
};

const postMovies = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    trailer,
    image,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    owner: req.user._id,
    movieId,
  })
    .then((movie) => res.status(200).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Данные введены неверно'));
      }
      next(err);
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .catch(() => {
      throw new NotFoundError('Нет фильма с таким id');
    })
    .then((data) => {
      if (!data) {
        throw new NotFoundError('Нет фильма с таким id');
      }
      if (req.user._id === data.owner.toString()) {
        Movie.findByIdAndRemove({ _id: data._id })
          .then(() => {
            res.status(201).send({ message: 'Фильм успешно удален' });
          })
          .catch(next);
      } else {
        throw new ForbiddenError('Вы не можете удалять фильмы других пользователей');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Нет фильма с таким id');
      } else {
        next(err);
      }
    });
};

module.exports = {
  getMovies,
  postMovies,
  deleteMovie,
};
