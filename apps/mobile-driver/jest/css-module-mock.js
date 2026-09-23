// @dashroute/ui's barrel re-exports web-only components (OrderStatusBadge,
// Sidebar, Select, DataTable, DetailPanel) that import CSS Modules. Those
// files never execute at runtime on native (Metro's platform resolution
// skips them), but Jest resolves the barrel eagerly, so `.module.css`
// imports need a harmless stub.
module.exports = new Proxy({}, { get: (_, prop) => prop });
