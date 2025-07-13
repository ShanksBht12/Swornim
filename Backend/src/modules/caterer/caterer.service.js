const Caterer = require("./caterer.model");
const User = require("../user/user.model");
const { UserStatus } = require("../../config/constants");
const { Op } = require("sequelize");
const cloudinarySvc = require("../../services/cloudinary.service");

class CatererService {
  async createCaterer(data) {
    try {
      if (data.profileImage && data.profileImage.path) {
        const uploadResult = await cloudinarySvc.fileUpload(data.profileImage.path, "caterers/profiles/");
        data.profileImage = uploadResult.url;
        data.profileImagePublicId = uploadResult.publicId;
      }
      const caterer = await Caterer.create(data);
      return caterer;
    } catch (exception) {
      throw exception;
    }
  }

  async getSingleRowByFilter(filter) {
    try {
      const caterer = await Caterer.findOne({
        where: filter,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "phone", "profileImage", "userType"],
          },
        ],
      });
      return caterer;
    } catch (exception) {
      throw exception;
    }
  }

  async getAllRowsByFilter(filter = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
        search = "",
        cuisineTypes = [],
        minRating = 0,
        maxPrice = null,
        minPrice = null,
        location = "",
        isAvailable = null,
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = { ...filter };

      if (search) {
        whereClause[Op.or] = [
          { businessName: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (cuisineTypes.length > 0) {
        whereClause.cuisineTypes = {
          [Op.overlap]: cuisineTypes,
        };
      }

      if (minRating > 0) {
        whereClause.rating = {
          [Op.gte]: minRating,
        };
      }

      if (minPrice !== null || maxPrice !== null) {
        whereClause.pricePerPerson = {};
        if (minPrice !== null) {
          whereClause.pricePerPerson[Op.gte] = minPrice;
        }
        if (maxPrice !== null) {
          whereClause.pricePerPerson[Op.lte] = maxPrice;
        }
      }

      if (location) {
        whereClause.location = {
          [Op.contains]: { city: location },
        };
      }

      if (isAvailable !== null) {
        whereClause.isAvailable = isAvailable;
      }

      const { count, rows } = await Caterer.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "phone", "profileImage", "userType"],
          },
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        caterers: rows,
        totalCount: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        hasNextPage: page * limit < count,
        hasPrevPage: page > 1,
      };
    } catch (exception) {
      throw exception;
    }
  }

  async updateSingleRowByFilter(updateData, filter) {
    try {
      const [updatedCount] = await Caterer.update(updateData, {
        where: filter,
      });
      return updatedCount;
    } catch (exception) {
      throw exception;
    }
  }

  async deleteSingleRowByFilter(filter) {
    try {
      const deletedCount = await Caterer.destroy({
        where: filter,
      });
      return deletedCount;
    } catch (exception) {
      throw exception;
    }
  }

  async getCatererWithUser(catererId) {
    try {
      const caterer = await Caterer.findOne({
        where: { id: catererId },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "phone", "profileImage", "userType"],
          },
        ],
      });
      return caterer;
    } catch (exception) {
      throw exception;
    }
  }

  async updateCatererProfile(catererId, updateData) {
    try {
      const caterer = await this.getSingleRowByFilter({ id: catererId });
      if (!caterer) {
        throw {
          code: 404,
          status: "CATERER_NOT_FOUND",
          message: "Caterer not found",
        };
      }
      if (updateData.profileImage && updateData.profileImage.path) {
        if (caterer.profileImagePublicId) {
          await cloudinarySvc.deleteFile(caterer.profileImagePublicId);
        }
        const uploadResult = await cloudinarySvc.fileUpload(updateData.profileImage.path, "caterers/profiles/");
        updateData.profileImage = uploadResult.url;
        updateData.profileImagePublicId = uploadResult.publicId;
      }
      await caterer.update(updateData);
      return caterer;
    } catch (exception) {
      throw exception;
    }
  }

  async getTopRatedCaterers(limit = 10) {
    try {
      const caterers = await Caterer.findAll({
        where: { userStatus: UserStatus.ACTIVE },
        order: [["rating", "DESC"]],
        limit,
      });
      return caterers;
    } catch (exception) {
      throw exception;
    }
  }

  async getAvailableCaterers() {
    try {
      const caterers = await Caterer.findAll({
        where: { isAvailable: true, userStatus: UserStatus.ACTIVE },
      });
      return caterers;
    } catch (exception) {
      throw exception;
    }
  }
}

module.exports = new CatererService(); 