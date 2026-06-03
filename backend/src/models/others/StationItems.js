import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import Stations from './Stations.js'
// import ItemTypes from './ItemTypes.js'

/**
 * StationItems Model
 * Table: station_items
 */
const StationItems = sequelize.define('StationItems', {
  lineType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'line_type', // 映射到数据库列名
  },
  lineNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'line_number', // 映射到数据库列名
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'source', // 映射到数据库列名
  },
  itemType: {
    type: DataTypes.STRING(24),
    allowNull: false,
    primaryKey: true,
    field: 'item_type', // 映射到数据库列名
  },
}, {
  tableName: 'station_items',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'station_items 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// StationItems.belongsTo(Stations, { foreignKey: 'lineType' })
// StationItems.belongsTo(Stations, { foreignKey: 'lineNumber' })
// StationItems.belongsTo(Stations, { foreignKey: 'source' })
// StationItems.belongsTo(ItemTypes, { foreignKey: 'itemType' })

export default StationItems
