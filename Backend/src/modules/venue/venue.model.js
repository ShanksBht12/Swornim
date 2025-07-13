const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.config");
const { UserStatus } = require("../../config/constants");

const Venue = sequelize.define(
  "Venue",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    businessName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "business_name",
    },
    image: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    pricePerHour: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      field: "price_per_hour",
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    venueTypes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "venue_types",
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "total_reviews",
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_available",
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    userStatus: {
      type: DataTypes.ENUM(
        UserStatus.PENDING,
        UserStatus.APPROVED,
        UserStatus.ACTIVE,
        UserStatus.SUSPENDED,
        UserStatus.REJECTED,
        UserStatus.INACTIVE
      ),
      allowNull: false,
      defaultValue: UserStatus.PENDING,
      field: "user_status",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "venues",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id"],
      },
      {
        fields: ["business_name"],
      },
      {
        fields: ["user_status"],
      },
      {
        fields: ["is_available"],
      },
      {
        fields: ["rating"],
      },
    ],
  }
);

module.exports = Venue; 