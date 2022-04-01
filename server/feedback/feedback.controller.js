const Feedback = require("./feedback.model");
const httpStatus = require("http-status");
const APIError = require("../helpers/APIError");
const config = require("../../config/config");

const apiFeedback = {
  /**
   * Load feedback and append to req.
   */
  load(req, res, next, id) {
    Feedback.get(id)
      .then((feedback) => {
        req.feedback = feedback; // eslint-disable-line no-param-reassign
        return next();
      })
      .catch((e) => next(e));
  },

  /**
   * Get feedback
   * @returns {Feedback}
   */
  get(req, res) {
    return res.json(req.feedback);
  },

  /**
   * Create new feedback
   * @property {string} req.body.comment - The comment of feedback.
   * @property {string} req.body.rating - The rating of feedback.
   * @property {string} req.body.service - The service of feedback.
   * @property {string} req.body.ratingBy - The user of feedback.
   * @returns {Feedback}
   */
  async create(req, res, next) {
    const feedback = new Feedback(req.body);
    try {
      const result = await feedback.save();
      res.status(httpStatus.CREATED).json(result);
    } catch (error) {
      next(new APIError(error.message, httpStatus.NOT_FOUND));
    }
  },

  async update(req, res, next) {
    const _idFeedback = req.params.feedbackId;
    const updateFields = req.body;

    try {
      const status = await Feedback.updateFeedback({
        idFeedback: _idFeedback,
        updates: updateFields,
      });
      res.status(httpStatus.OK).json(status);
    } catch (error) {
      next(new APIError(error.message));
    }
  },

  async listFeedbacks(req, res, next) {
    let filtros = {};
    let result = {};
    let campos = [];

    const pagina = parseInt(req.query.pagina || 0, 10);
    const tamanhoPagina = Math.min(
      parseInt(req.query.tamanhoPagina || 20, 10),
      100
    );

    if (req.query.filtros) {
      try {
        filtros = JSON.parse(req.query.filtros);
      } catch (error) {
        next(
          new APIError(
            "Filtro mal formatado, esperado um json",
            httpStatus.BAD_REQUEST,
            true
          )
        );
      }
    }

    if (req.query.campos) {
      campos = req.query.campos.split(",");
    }

    try {
      result = await Feedback.list({ pagina, tamanhoPagina, filtros, campos });
    } catch (error) {
      next(error);
    }

    res.setHeader("X-Total-Count", result.count);
    res.status(httpStatus.OK).json(result.feedbacks);
  },
  /**
   * Get by service
   * param {string} req.params.serviceId - The service id.
   * @returns {Feedback}
   */
  async getRatingByService(req, res, next) {
    const _idService = req.params.serviceId;
    let result = {};
    try {
      result = await Feedback.getRatingByService(_idService);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      next(new APIError(error.message));
    }
  },
  /**
   * Get by user
   * @property {string} req.params.userId - The user id.
   * @returns {Feedback}
   */
  async getByUser(req, res, next) {
    const _idUser = req.params.userID;
    let result = {};
    try {
      result = await Feedback.getByUser(_idUser);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      next(new APIError(error.message));
    }
  },

  async getByService(req, res, next) {
    const _idService = req.params.serviceID;
    let result = {};
    try {
      result = await Feedback.getByService(_idService);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      next(new APIError(error.message));
    }
  },

  /**
   * Delete feedback.
   * @returns {Feedback}
   */
  remove(req, res, next) {
    const feedback = req.feedback;
    feedback
      .remove()
      .then((deletedFeedback) => res.json(deletedFeedback))
      .catch((e) => next(e));
  },
};

module.exports = apiFeedback;
