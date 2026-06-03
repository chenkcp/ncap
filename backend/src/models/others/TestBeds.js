import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

// Foreign key references
// import TestBedTypes from './TestBedTypes.js'
// import Stations from './Stations.js'

/**
 * TestBeds Model
 * Table: test_beds
 */
const TestBeds = sequelize.define('TestBeds', {
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
  testBed: {
    type: DataTypes.STRING(16),
    allowNull: false,
    primaryKey: true,
    field: 'test_bed', // 映射到数据库列名
  },
  testBedType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'test_bed_type', // 映射到数据库列名
  },
}, {
  tableName: 'test_beds',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'test_beds 表',
})

/**
 * 关联关系定义
 * 在 models/index.js 中配置以下关联:
 */
// TestBeds.belongsTo(TestBedTypes, { foreignKey: 'testBedType' })
// TestBeds.belongsTo(Stations, { foreignKey: 'lineType' })
// TestBeds.belongsTo(Stations, { foreignKey: 'lineNumber' })
// TestBeds.belongsTo(Stations, { foreignKey: 'source' })

export default TestBeds
