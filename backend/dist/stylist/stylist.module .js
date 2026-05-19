"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StylistModule = void 0;
const common_1 = require("@nestjs/common");
const stylist_controller_1 = require("./stylist.controller");
const stylist_service_1 = require("./stylist.service");
const Stylist_repository_1 = require("./Stylist.repository");
let StylistModule = class StylistModule {
};
exports.StylistModule = StylistModule;
exports.StylistModule = StylistModule = __decorate([
    (0, common_1.Module)({
        controllers: [stylist_controller_1.StylistController],
        providers: [stylist_service_1.StylistService, Stylist_repository_1.StylistRepository],
        exports: [stylist_service_1.StylistService],
    })
], StylistModule);
//# sourceMappingURL=stylist.module%20.js.map