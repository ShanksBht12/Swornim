const UserModel = require("./user.model");
const { safeUserData } = require("../../utilities/helpers");
const { UserType } = require("../../config/constants");

class UserService {
  async createUser(data) {
    try {
      // Enforce userType is valid and normalized
      if (data.userType) {
        if (!Object.values(UserType).includes(data.userType)) {
          throw new Error("Invalid userType");
        }
      } else {
        data.userType = UserType.CLIENT;
      }
      const user = await UserModel.create(data);
      return user;
    } catch (exception) {
      throw exception;
    }
  }

  async getSingleRowByFilter(filter) {
    try {
      const user = await UserModel.findOne({ where: filter });
      return user;
    } catch (exception) {
      throw exception;
    }
  }

  async updateSingleRowByFilter(updateData, filter) {
    // Enforce userType is valid and normalized on update
    if (updateData.userType && !Object.values(UserType).includes(updateData.userType)) {
      throw new Error("Invalid userType");
    }
    return await UserModel.update(updateData, { where: filter, returning: true, plain: true })
      .then(result => result[1]);
  }

  async getAllUsers(filter = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        orderBy = "createdAt",
        orderDirection = "DESC",
      } = options;

      const offset = (page - 1) * limit;

      const users = await UserModel.findAndCountAll({
        where: filter,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[orderBy, orderDirection]],
        attributes: {
          exclude: ["password", "resetToken", "emailVerificationToken"],
        },
      });

      return {
        users: users.rows,
        total: users.count,
        totalPages: Math.ceil(users.count / limit),
        currentPage: parseInt(page),
      };
    } catch (exception) {
      throw exception;
    }
  }

  async deleteUser(id) {
    try {
      const result = await UserModel.destroy({
        where: { id },
      });
      return result > 0;
    } catch (exception) {
      throw exception;
    }
  }

  async deleteUserSessions(userId) {
    try {
      const SessionModel = require("../auth/session.model");
      const result = await SessionModel.destroy({
        where: { userId },
      });
      return result;
    } catch (exception) {
      throw exception;
    }
  }

  // Check for active bookings where user is service provider
  async getActiveBookingsByProvider(serviceProviderId) {
    try {
      const Booking = require("../booking/booking.model");
      const { Op } = require("sequelize");
      
      const activeBookings = await Booking.findAll({
        where: {
          serviceProviderId,
          status: {
            [Op.in]: [
              'pending_provider_confirmation',
              'confirmed_awaiting_payment', 
              'confirmed_paid',
              'in_progress'
            ]
          }
        }
      });
      
      return activeBookings;
    } catch (exception) {
      throw exception;
    }
  }

  // Delete all packages created by service provider
  async deleteServiceProviderPackages(serviceProviderId) {
    try {
      const ServicePackage = require("../package/package.model");
      const result = await ServicePackage.destroy({
        where: { serviceProviderId }
      });
      return result;
    } catch (exception) {
      throw exception;
    }
  }

  // Delete all events created by service provider (and their ticket bookings)
  async deleteServiceProviderEvents(organizerId) {
    try {
      const Event = require("../event/event.model");
      const EventTicketBooking = require("../event_ticket_booking/event_ticket_booking.model");
      
      // First, get all events by this organizer
      const events = await Event.findAll({
        where: { organizerId },
        attributes: ['id']
      });
      
      const eventIds = events.map(event => event.id);
      
      // Delete all ticket bookings for these events
      if (eventIds.length > 0) {
        await EventTicketBooking.destroy({
          where: { 
            event_id: { [require("sequelize").Op.in]: eventIds }
          }
        });
      }
      
      // Then delete the events
      const result = await Event.destroy({
        where: { organizerId }
      });
      
      return result;
    } catch (exception) {
      throw exception;
    }
  }

  // Cancel all non-active bookings where user is service provider
  async cancelServiceProviderBookings(serviceProviderId) {
    try {
      const Booking = require("../booking/booking.model");
      const { Op } = require("sequelize");
      
      // Cancel completed and other non-active bookings
      const result = await Booking.update(
        { 
          status: 'cancelled_by_provider',
          cancellationReason: 'Service provider account deleted',
          cancellationRequestedBy: 'provider', // changed from 'system' to 'provider'
          cancellationRequestedAt: new Date()
        },
        {
          where: {
            serviceProviderId,
            status: {
              [Op.in]: ['completed', 'dispute_resolved']
            }
          }
        }
      );
      
      return result[0]; // Number of affected rows
    } catch (exception) {
      throw exception;
    }
  }

  getUserPublicProfile(user) {
    if (!user) return null;
    // TEMP: Include emailVerificationToken for debugging
    const publicData = safeUserData(user);
    publicData.emailVerificationToken = user.emailVerificationToken;
    return publicData;
  }

  async getUserDashboardData(userId) {
    try {
      const user = await this.getSingleRowByFilter({ id: userId });
      if (!user) return null;

      return {
        user: this.getUserPublicProfile(user),
        canAccessServiceProviderFeatures:
          user.canAccessServiceProviderFeatures(),
        userRoleDisplay: user.getUserRoleDisplayName(),
        accountStatus: {
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          userStatus: user.userStatus,
        },
      };
    } catch (exception) {
      throw exception;
    }
  }
}

const userSvc = new UserService();
module.exports = userSvc;