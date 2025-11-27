"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const conRouter_1 = require("./conRouter");
const router = (0, express_1.Router)();
exports.routes = router;
router.use("/api", conRouter_1.conRoutes);
//# sourceMappingURL=index.js.map