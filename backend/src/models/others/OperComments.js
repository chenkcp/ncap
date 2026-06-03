import { DataTypes } from 'sequelize'
import sequelize from '../config/databases.js'

/**
 * OperComments Model
 * Table: oper_comments
 */
const OperComments = sequelize.define('OperComments', {
  productFamilyCd: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'product_family_cd', // 映射到数据库列名
  },
  processAreaCd: {
    type: DataTypes.STRING(3),
    allowNull: false,
    field: 'process_area_cd', // 映射到数据库列名
  },
  moduleId: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'module_id', // 映射到数据库列名
  },
  stationId: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'station_id', // 映射到数据库列名
  },
  commentTx: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'comment_tx', // 映射到数据库列名
  },
  displayOrderCd: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'display_order_cd', // 映射到数据库列名
  },
}, {
  tableName: 'oper_comments',
  timestamps: false, // 启用时间戳
  underscored: true, // 使用下划线命名
  comment: 'oper_comments 表',
})

export default OperComments
