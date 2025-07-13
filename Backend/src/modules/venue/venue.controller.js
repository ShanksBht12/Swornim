const venueSvc = require("./venue.service");
const userSvc = require("../user/user.service");
const { deleteFile, safeUserData } = require("../../utilities/helpers");
const { UserType } = require("../../config/constants");

class VenueController {
  async createVenue(req, res, next) {
    try {
      const existing = await venueSvc.getSingleRowByFilter({
        userId: req.loggedInUser.id,
      });
      if (existing) {
        if (req.file) deleteFile(req.file.path);
        throw {
          code: 409,
          status: "VENUE_PROFILE_EXISTS",
          message: "Venue profile already exists for this user",
        };
      }
      if (req.loggedInUser.userType !== UserType.VENUE) {
        if (req.file) deleteFile(req.file.path);
        throw {
          code: 403,
          status: "INVALID_USER_TYPE",
          message: "Only venue users can create venue profiles",
        };
      }
      const data = {
        ...req.body,
        userId: req.loggedInUser.id,
      };
      if (req.file) data.image = req.file;
      const venue = await venueSvc.createVenue(data);
      const withUser = await venueSvc.getVenueWithUser(venue.id);
      res.status(201).json({
        data: withUser,
        message: "Venue profile created successfully",
        status: "CREATED",
        options: null,
      });
    } catch (exception) {
      if (req.file) deleteFile(req.file.path);
      next(exception);
    }
  }

  async getVenueProfile(req, res, next) {
    try {
      const { venueId } = req.params;
      const venue = await venueSvc.getVenueWithUser(venueId);
      if (!venue) {
        throw {
          code: 404,
          status: "VENUE_NOT_FOUND",
          message: "Venue not found",
        };
      }
      res.json({
        data: venue,
        message: "Venue profile retrieved successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getMyVenueProfile(req, res, next) {
    try {
      const venue = await venueSvc.getSingleRowByFilter({
        userId: req.loggedInUser.id,
      });
      if (!venue) {
        throw {
          code: 404,
          status: "VENUE_PROFILE_NOT_FOUND",
          message: "Venue profile not found",
        };
      }
      const withUser = await venueSvc.getVenueWithUser(venue.id);
      res.json({
        data: withUser,
        message: "Venue profile retrieved successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async updateVenueProfile(req, res, next) {
    try {
      const venue = await venueSvc.getSingleRowByFilter({
        userId: req.loggedInUser.id,
      });
      if (!venue) {
        if (req.file) deleteFile(req.file.path);
        throw {
          code: 404,
          status: "VENUE_PROFILE_NOT_FOUND",
          message: "Venue profile not found",
        };
      }
      if (req.file) req.body.image = req.file;
      const updated = await venueSvc.updateVenueProfile(
        venue.id,
        req.body
      );
      const withUser = await venueSvc.getVenueWithUser(updated.id);
      res.json({
        data: withUser,
        message: "Venue profile updated successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      if (req.file) deleteFile(req.file.path);
      next(exception);
    }
  }

  async searchVenues(req, res, next) {
    try {
      const searchOptions = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search || "",
        amenities: req.query.amenities ? req.query.amenities.split(",") : [],
        minRating: parseFloat(req.query.minRating) || 0,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
        location: req.query.location || "",
        isAvailable: req.query.isAvailable !== undefined ? req.query.isAvailable === "true" : null,
        sortBy: req.query.sortBy || "rating",
        sortOrder: req.query.sortOrder || "DESC",
      };
      const result = await venueSvc.getAllRowsByFilter({}, searchOptions);
      res.json({
        data: result,
        message: "Venues retrieved successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getTopRatedVenues(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const venues = await venueSvc.getTopRatedVenues(limit);
      res.json({
        data: venues,
        message: "Top rated venues retrieved successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getAvailableVenues(req, res, next) {
    try {
      const venues = await venueSvc.getAvailableVenues();
      res.json({
        data: venues,
        message: "Available venues retrieved successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
}

module.exports = new VenueController(); 