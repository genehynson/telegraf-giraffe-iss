
export const findStringColumns = (table) =>
  table.columnKeys.filter(k => table.getColumnType(k) === 'string')