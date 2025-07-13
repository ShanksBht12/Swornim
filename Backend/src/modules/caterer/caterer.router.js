const catererRouter = require("express").Router();
const catererCtrl = require("./caterer.controller");
const auth = require("../../middlewares/auth.middleware");
const bodyValidator = require("../../middlewares/validator.middleware");
const uploader = require("../../middlewares/uploader.middleware");
const { UserType } = require("../../config/constants");
const {
  CreateCatererDTO,
  UpdateCatererDTO,
  SearchCaterersDTO,
} = require("./caterer.validator");

// Public routes
catererRouter.get("/search", bodyValidator(SearchCaterersDTO, "query"), catererCtrl.searchCaterers);
catererRouter.get("/top-rated", catererCtrl.getTopRatedCaterers);
catererRouter.get("/available", catererCtrl.getAvailableCaterers);
catererRouter.get("/:catererId", catererCtrl.getCatererProfile);

// Protected routes - Caterer only
catererRouter.post(
  "/profile",
  auth([UserType.CATERER]),
  uploader.single("profileImage"),
  bodyValidator(CreateCatererDTO),
  catererCtrl.createCaterer
);

catererRouter.get(
  "/profile/me",
  auth([UserType.CATERER]),
  catererCtrl.getMyCatererProfile
);

catererRouter.put(
  "/profile",
  auth([UserType.CATERER]),
  uploader.single("profileImage"),
  bodyValidator(UpdateCatererDTO),
  catererCtrl.updateCatererProfile
);

module.exports = catererRouter; 