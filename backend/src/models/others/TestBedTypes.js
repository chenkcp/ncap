import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * TestBedTypes Model
 * Table: test_bed_types
 */
const TestBedTypes = sequelize.define('TestBedTypes', {
  testBedType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
    field: 'test_bed_type', // 映射到数据库列名
  },
}, {
  tableName: 'test_bed_types',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'test_bed_types 表',
})

export default TestBedTypes
