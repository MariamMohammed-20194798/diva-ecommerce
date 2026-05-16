"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBackendEnvFilePaths = resolveBackendEnvFilePaths;
exports.resolveBackendRoot = resolveBackendRoot;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function resolveBackendEnvFilePaths() {
    const candidates = [
        (0, node_path_1.resolve)(process.cwd(), '.env'),
        (0, node_path_1.resolve)(process.cwd(), 'backend', '.env'),
        (0, node_path_1.resolve)(__dirname, '..', '..', '.env'),
    ];
    return [...new Set(candidates.filter((path) => (0, node_fs_1.existsSync)(path)))];
}
function resolveBackendRoot() {
    if ((0, node_fs_1.existsSync)((0, node_path_1.join)(process.cwd(), 'prisma', 'schema.prisma'))) {
        return process.cwd();
    }
    if ((0, node_fs_1.existsSync)((0, node_path_1.join)(process.cwd(), 'backend', 'prisma', 'schema.prisma'))) {
        return (0, node_path_1.join)(process.cwd(), 'backend');
    }
    return (0, node_path_1.resolve)(__dirname, '..', '..');
}
//# sourceMappingURL=env-path.js.map