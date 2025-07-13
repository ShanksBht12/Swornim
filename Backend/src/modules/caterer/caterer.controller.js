const catererSvc = require("./caterer.service");
const userSvc = require("../user/user.service");
const { deleteFile, safeUserData } = require("../../utilities/helpers");
const { UserType } = require("../../config/constants");

class CatererController {
  async createCaterer(req, res, next) {
    try {
      const existing = await catererSvc.getSingleRowByFilter({
        userId: req.loggedInUser.id,
      });
      if (existing) {
        if (req.file) deleteFile(req.file.path);
        throw {
          code: 409,
          status: "CATERER_PROFILE_EXISTS",
          message: "Caterer profile already exists for this user",
        };
      }
      if (req.loggedInUser.userType !== UserType.CATERER) {
        if (req.file) deleteFile(req.file.path);
        throw {
          code: 403,
          status: "INVALID_USER_TYPE",
          message: "Only caterers can create caterer profiles",
        };
      }
      const data = {
        ...req.body,
        userId: req.loggedInUser.id,
      };
      if (req.file) data.profileImage = req.file;
      const caterer = await catererSvc.createCaterer(data);
      const withUser = await catererSvc.getCatererWithUser(caterer.id);
      res.status(201).json({
        data: withUser,
        message: "Caterer profile created successfully",
        status: "CREATED",
        options: null,
      });
    } catch (exception) {
      if (req.file) deleteFile(req.file.path);
      next(exception);
    }
  }

  async getCatererProfile(req, res, next) {
    try {
      const { catererId } = req.params;
      const caterer = await catererSvc.getCatererWithUser(catererId);
      if (!caterer) {
        throw {
          code: 404,
          status: "CATERER_NOT_FOUND",
          message: "Caterer not found",
        };
      }
      res.json({
        data: caterer,
        message: "Caterer profile retrieved successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getMyCatererProfile(req, res, next) {
    try {
      const caterer = await catererSvc.getSingleRowByFilter({
        userId: req.loggedInUser.id,
      });
      if (!caterer) {
        throw {
          code: 404,
          status: "CATERER_PROFILE_NOT_FOUND",
          message: "Caterer profile not found",
        };
      }
      const withUser = await catererSvc.getCatererWithUser(caterer.id);
      res.json({
        data: withUser,
        message: "Caterer profile retrieved successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async updateCatererProfile(req, res, next) {
    try {
      const caterer = await catererSvc.getSingleRowByFilter({
        userId: req.loggedInUser.id,
      });
      if (!caterer) {
        if (req.file) deleteFile(req.file.path);
        throw {
          code: 404,
          status: "CATERER_PROFILE_NOT_FOUND",
          message: "Caterer profile not found",
        };
      }
      if (req.file) req.body.profileImage = req.file;
      const updated = await catererSvc.updateCatererProfile(
        caterer.id,
        req.body
      );
      const withUser = await catererSvc.getCatererWithUser(updated.id);
      res.json({
        data: withUser,
        message: "Caterer profile updated successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      if (req.file) deleteFile(req.file.path);
      next(exception);
    }
  }

  async searchCaterers(req, res, next) {
    try {
      const searchOptions = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search || "",
        cuisineTypes: req.query.cuisineTypes ? req.query.cuisineTypes.split(",") : [],
        minRating: parseFloat(req.query.minRating) || 0,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
        location: req.query.location || "",
        isAvailable: req.query.isAvailable !== undefined ? req.query.isAvailable === "true" : null,
        sortBy: req.query.sortBy || "rating",
        sortOrder: req.query.sortOrder || "DESC",
      };
      const result = await catererSvc.getAllRowsByFilter({}, searchOptions);
      res.json({
        data: result,
        message: "Caterers retrieved successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getTopRatedCaterers(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const caterers = await catererSvc.getTopRatedCaterers(limit);
      res.json({
        data: caterers,
        message: "Top rated caterers retrieved successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getAvailableCaterers(req, res, next) {
    try {
      const caterers = await catererSvc.getAvailableCaterers();
      res.json({
        data: caterers,
        message: "Available caterers retrieved successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
}

module.exports = new CatererController(); 