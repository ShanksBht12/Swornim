const userSvc = require("./user.service");
const authSvc = require("../auth/auth.service");
const { deleteFile } = require("../../utilities/helpers");
const cloudinarySvc = require("../../services/cloudinary.service");
const { UserType } = require("../../config/constants");

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const {
        page,
        limit,
        userType,
        userStatus,
        search,
        orderBy,
        orderDirection,
      } = req.query;

      const filter = {};
      if (userType) filter.userType = userType;
      if (userStatus) filter.userStatus = userStatus;
      if (search) {
        filter[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        orderBy: orderBy || "createdAt",
        orderDirection: orderDirection || "DESC",
      };

      const result = await userSvc.getAllUsers(filter, options);

      res.json({
        data: result,
        message: "Users fetched successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userSvc.getSingleRowByFilter({ id });

      if (!user) {
        throw {
          code: 404,
          status: "USER_NOT_FOUND",
          message: "User not found",
        };
      }

      res.json({
        data: userSvc.getUserPublicProfile(user),
        message: "User fetched successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await userSvc.getSingleRowByFilter({ id });
      if (!user) {
        throw {
          code: 404,
          status: "USER_NOT_FOUND",
          message: "User not found",
        };
      }

      // Handle profile image upload to Cloudinary
      if (req.file) {
        // Delete old image from Cloudinary if publicId is stored
        if (user.profileImagePublicId) {
          await cloudinarySvc.deleteFile(user.profileImagePublicId);
        }
        // Upload new image
        const uploadResult = await cloudinarySvc.fileUpload(req.file.path, "users/profiles/");
        updateData.profileImage = uploadResult.url;
        updateData.profileImagePublicId = uploadResult.publicId;
      }

      const updatedUser = await userSvc.updateSingleRowByFilter(updateData, {
        id,
      });

      res.json({
        data: userSvc.getUserPublicProfile(updatedUser),
        message: "User updated successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      const user = await userSvc.getSingleRowByFilter({ id });
      if (!user) {
        throw {
          code: 404,
          status: "USER_NOT_FOUND",
          message: "User not found",
        };
      }

      // Handle service provider specific deletion logic
      if (user.userType !== UserType.CLIENT) {
        console.log(`Handling service provider deletion for user: ${user.id}`);

        // Check for active bookings where user is the service provider
        try {
          const activeBookings = await userSvc.getActiveBookingsByProvider(user.id);
          if (activeBookings && activeBookings.length > 0) {
            throw {
              code: 400,
              status: "CANNOT_DELETE_ACTIVE_PROVIDER",
              message: `Cannot delete service provider. They have ${activeBookings.length} active booking(s). Please cancel or complete all bookings first.`,
            };
          }
        } catch (activeBookingError) {
          if (activeBookingError.code === 400) {
            throw activeBookingError; // Re-throw the blocking error
          }
          console.error('Error checking active bookings:', activeBookingError);
        }

        // Handle packages deletion
        try {
          const packageCount = await userSvc.deleteServiceProviderPackages(user.id);
          console.log(`Deleted ${packageCount} packages for user ${user.id}`);
        } catch (packageError) {
          console.error('Error deleting packages:', packageError);
          // Continue with deletion, but log the error
        }

        // Handle events deletion (and their ticket bookings)
        try {
          const eventCount = await userSvc.deleteServiceProviderEvents(user.id);
          console.log(`Deleted ${eventCount} events for user ${user.id}`);
        } catch (eventError) {
          console.error('Error deleting events:', eventError);
          // Continue with deletion, but log the error
        }

        // Cancel all bookings where user is the service provider (non-active ones)
        try {
          const cancelledBookings = await userSvc.cancelServiceProviderBookings(user.id);
          console.log(`Cancelled ${cancelledBookings} bookings for user ${user.id}`);
        } catch (bookingError) {
          console.error('Error cancelling bookings:', bookingError);
          // Continue with deletion, but log the error
        }
      }

      // Step 1: Revoke all user sessions (marks them as inactive)
      try {
        await authSvc.revokeAllUserSessions(id);
      } catch (sessionError) {
        console.error('Error revoking user sessions:', sessionError);
      }

      // Step 2: Delete all user sessions from database
      try {
        await userSvc.deleteUserSessions(id);
      } catch (sessionDeleteError) {
        console.error('Error deleting user sessions:', sessionDeleteError);
      }

      // Step 3: Delete profile image from local storage if exists
      if (user.profileImage) {
        try {
          deleteFile(user.profileImage);
        } catch (fileError) {
          console.error('Error deleting local profile image:', fileError);
        }
      }

      // Step 4: Delete profile image from Cloudinary if exists
      if (user.profileImagePublicId) {
        try {
          await cloudinarySvc.deleteFile(user.profileImagePublicId);
        } catch (cloudinaryError) {
          console.error('Error deleting image from Cloudinary:', cloudinaryError);
        }
      }

      // Step 5: Finally delete the user
      const deleted = await userSvc.deleteUser(id);
      if (!deleted) {
        throw {
          code: 500,
          status: "DELETE_FAILED",
          message: "Failed to delete user",
        };
      }

      res.json({
        data: null,
        message: `${user.userType === UserType.CLIENT ? 'Client' : 'Service provider'} deleted successfully`,
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getDashboardData(req, res, next) {
    try {
      const userId = req.loggedInUser.id;
      const dashboardData = await userSvc.getUserDashboardData(userId);

      res.json({
        data: dashboardData,
        message: "Dashboard data fetched successfully",
        status: "OK",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
}

const userCtrl = new UserController();
module.exports = userCtrl;