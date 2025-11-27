"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conRoutes = void 0;
const express_1 = require("express");
const conController_1 = require("../controllers/conController");
const router = (0, express_1.Router)();
exports.conRoutes = router;
router.get("/status", conController_1.conController);
//# sourceMappingURL=conRouter.js.map