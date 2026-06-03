// // import sequelize from 'sequelize'
// // import env from '../config/env.js'

// // 创建 Sequelize 实例
// // const sequelize = new Sequelize(
// //   env.db.database,
// //   env.db.username,
// //   env.db.password,
// //   {
// //     host: env.db.host,
// //     port: env.db.port,
// //     dialect: env.db.dialect,
// //     dialectOptions: env.db.dialectOptions,
// //     pool: env.db.pool,
// //     logging: env.db.logging,
// //     define: {
// //       timestamps: false,
// //       underscored: true,
// //       freezeTableName: true,
// //     },
// //   }
// // )

// // // 测试数据库连接
// // const testConnection = async () => {
// //   try {
// //     await sequelize.authenticate()
// //     console.log('✅ Database connection established successfully.')
// //   } catch (error) {
// //     console.error('❌ Unable to connect to the database:', error.message)
// //     throw error
// //   }
// // }

// // const sequelize = new Sequelize(
// //   env.db.database,
// //   env.db.username,
// //   env.db.password,
// //   env.db
// // )
// // console.log("--------------- loaded sequelize")

// // import sequelize from '../config/databases.js'
// // console.log("import sequelize", sequelize)

// // 导入所有模型
// import Accumulators from './Accumulators.js'
// import AuthorityLevels from './AuthorityLevels.js'
// import CapExtended from './CapExtended.js'
// import CapInput from './CapInput.js'
// import CapInput2 from './CapInput2.js'
// import CapInput3 from './CapInput3.js'
// import CapSummary from './CapSummary.js'
// import CapSymptoms from './CapSymptoms.js'
// import ClientCustomers from './ClientCustomers.js'
// import ClientServers from './ClientServers.js'
// import ClientTypes from './ClientTypes.js'
// import Clients from './Clients.js'
// import Colors from './Colors.js'
// import CsbStatuses from './CsbStatuses.js'
// import CsbTypes from './CsbTypes.js'
// import Csbs from './Csbs.js'
// import CycleEvents from './CycleEvents.js'
// import DefectClasses from './DefectClasses.js'
// import DimTime from './DimTime.js'
// import Dtproperties from './Dtproperties.js'
// import DuplicatePenId from './DuplicatePenId.js'
// import EnumParameters from './EnumParameters.js'
// import Examples from './Examples.js'
// import Holddups from './Holddups.js'
// import Holdkey from './Holdkey.js'
// import InkWeight from './InkWeight.js'
// import InkWtStatistic from './InkWtStatistic.js'
// import ItemTypes from './ItemTypes.js'
// import LevelOneDescrip from './LevelOneDescrip.js'
// import LevelTwoDescrip from './LevelTwoDescrip.js'
// import LineTypes from './LineTypes.js'
// import LotComments from './LotComments.js'
// import LotDefectCounts from './LotDefectCounts.js'
// import Lots from './Lot.js'
// import MaterialStatuses from './MaterialStatuses.js'
// import MetroLink from './MetroLink.js'
// import Metrology from './Metrology.js'
// import NextacpPensJunk1 from './NextacpPensJunk1.js'
// import NextcapPensJunk1 from './NextcapPensJunk1.js'
// import NextcapSourceQueue from './NextcapSourceQueue.js'
// import NextcapSourceQueueBackup from './NextcapSourceQueueBackup.js'
// import OperComments from './OperComments.js'
// import ParameterTypes from './ParameterTypes.js'
// import Passwords from './Passwords.js'
// import PenDefects from './PenDefects.js'
// import PenDefectsAudit from './PenDefectsAudit.js'
// import PenLotStatistic from './PenLotStatistic.js'
// import PenParametric from './PenParametric.js'
// import PenParametric20230417 from './PenParametric20230417.js'
// import PenParms from './PenParms.js'
// import Pens from './Pens.js'
// import Pens1 from './Pens1.js'
// import Pens12 from './Pens12.js'
// import Pens123 from './Pens123.js'
// import PhysicalLines from './PhysicalLines.js'
// import PicaLkp from './PicaLkp.js'
// import PicaLkpSp74w0030 from './PicaLkpSp74w0030.js'
// import PicaLkpSp74w0168 from './PicaLkpSp74w0168.js'
// import PicaLkp2023 from './PicaLkp2023.js'
// import Prods from './Prods.js'
// import ProductRefLlk from './ProductRefLlk.js'
// import ProductTypes from './ProductTypes.js'
// import Products from './Products.js'
// import Products20211024 from './Products20211024.js'
// import Products20220512 from './Products20220512.js'
// import ProductsDelete from './ProductsDelete.js'
// import QualityMonitors from './QualityMonitors.js'
// import QualityStates from './QualityStates.js'
// import RecoverySteps from './RecoverySteps.js'
// import Reportgrouping from './Reportgrouping.js'
// import RunTypes from './RunTypes.js'
// import RuntimeValues from './RuntimeValues.js'
// import SamplePlans from './SamplePlans.js'
// import Servers from './Servers.js'
// import ShiftBoundaries from './ShiftBoundaries.js'
// import ShiftDefinitions from './ShiftDefinitions.js'
// import Shifts from './Shifts.js'
// import Specs from './Specs.js'
// import StaticComments from './StaticComments.js'
// import StationItems from './StationItems.js'
// import StationUsers from './StationUsers.js'
// import Stations from './Stations.js'
// import SyncStates from './SyncStates.js'
// import SystemParameters from './SystemParameters.js'
// import TaskTypes from './TaskTypes.js'
// import TestBedTypes from './TestBedTypes.js'
// import TestBeds from './TestBeds.js'
// import TicapBatch from './TicapBatch.js'
// import TicapPens from './TicapPens.js'
// import UserTasks from './UserTasks.js'

// // 定义模型关联关系
// // TODO: 在这里添加模型之间的关联关系
// // 例如:
// // User.hasMany(Post, { foreignKey: 'userId' })
// // Post.belongsTo(User, { foreignKey: 'userId' })



// // 导出
// export {
//   Accumulators,
//   AuthorityLevels,
//   CapExtended,
//   CapInput,
//   CapInput2,
//   CapInput3,
//   CapSummary,
//   CapSymptoms,
//   ClientCustomers,
//   ClientServers,
//   ClientTypes,
//   Clients,
//   Colors,
//   CsbStatuses,
//   CsbTypes,
//   Csbs,
//   CycleEvents,
//   DefectClasses,
//   DimTime,
//   Dtproperties,
//   DuplicatePenId,
//   EnumParameters,
//   Examples,
//   Holddups,
//   Holdkey,
//   InkWeight,
//   InkWtStatistic,
//   ItemTypes,
//   LevelOneDescrip,
//   LevelTwoDescrip,
//   LineTypes,
//   LotComments,
//   LotDefectCounts,
//   Lots,
//   MaterialStatuses,
//   MetroLink,
//   Metrology,
//   NextacpPensJunk1,
//   NextcapPensJunk1,
//   NextcapSourceQueue,
//   NextcapSourceQueueBackup,
//   OperComments,
//   ParameterTypes,
//   Passwords,
//   PenDefects,
//   PenDefectsAudit,
//   PenLotStatistic,
//   PenParametric,
//   PenParametric20230417,
//   PenParms,
//   Pens,
//   Pens1,
//   Pens12,
//   Pens123,
//   PhysicalLines,
//   PicaLkp,
//   PicaLkpSp74w0030,
//   PicaLkpSp74w0168,
//   PicaLkp2023,
//   Prods,
//   ProductRefLlk,
//   ProductTypes,
//   Products,
//   Products20211024,
//   Products20220512,
//   ProductsDelete,
//   QualityMonitors,
//   QualityStates,
//   RecoverySteps,
//   Reportgrouping,
//   RunTypes,
//   RuntimeValues,
//   SamplePlans,
//   Servers,
//   ShiftBoundaries,
//   ShiftDefinitions,
//   Shifts,
//   Specs,
//   StaticComments,
//   StationItems,
//   StationUsers,
//   Stations,
//   SyncStates,
//   SystemParameters,
//   TaskTypes,
//   TestBedTypes,
//   TestBeds,
//   TicapBatch,
//   TicapPens,
//   UserTasks,
// }
