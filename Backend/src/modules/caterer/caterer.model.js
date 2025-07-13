const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database.config");
const { UserStatus } = require("../../config/constants");

const Caterer = sequelize.define(
  "Caterer",
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
    cuisineTypes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "cuisine_types",
    },
    serviceTypes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "service_types",
    },
    pricePerPerson: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      field: "price_per_person",
    },
    minGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      field: "min_guests",
    },
    maxGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 500,
      field: "max_guests",
    },
    menuItems: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "menu_items",
    },
    dietaryOptions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "dietary_options",
    },
    offersEquipment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "offers_equipment",
    },
    offersWaiters: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "offers_waiters",
    },
    availableDates: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: "available_dates",
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "experience_years",
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
    tableName: "caterers",
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

module.exports = Caterer; 