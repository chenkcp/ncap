import Accumulator from './Accumulator.js'
import ClientCustomer from './ClientCustomer.js'
import ClientType from './ClientType.js'
import DefectClass from './DefectClass.js'
import LevelOneDescrip from './LevelOneDescrip.js'
import LevelTwoDescrip from './LevelTwoDescrip.js'
import LineType from './LineType.js'
import Lot from './Lot.js'
import LotDefectCount from './LotDefectCount.js'
import LotComment from './LotComment.js'
import Pen from './Pen.js'
import PenDefect from './PenDefect.js'
import PhysicalLine from './PhysicalLine.js'
import Product from './Product.js'
import ProductType from './ProductType.js'
import RunType from './RunType.js'
import Shift from './Shift.js'
import StationUser from './StationUser.js'
import Station from './Station.js'
import RuntimeValue from './RuntimeValue.js'
import Csb from './Csb.js'
import ProductRefLlk from './ProductRefLlk.js'
import PenParametric from './PenParametric.js'


// LotDefectCount.belongsTo(Lot, { foreignKey: 'lotId' })
Lot.hasMany(LotDefectCount, { foreignKey: 'lotId', as: 'defectCounts' })
Lot.hasMany(Pen, { foreignKey: 'lotId', as: 'pens' })
Lot.hasMany(LotComment, { foreignKey: 'lotId', as: 'comments' })
Pen.hasMany(PenDefect, { foreignKey: 'penId', as: 'defects' })

export default {
  Accumulator,
  ClientCustomer,
  ClientType,
  DefectClass,
  LevelOneDescrip,
  LevelTwoDescrip,
  LineType,
  Lot,
  LotDefectCount,
  LotComment,
  Pen,
  PenDefect,
  PhysicalLine,
  Product,
  ProductType,
  RunType,
  Shift,
  StationUser,
  Station,
  RuntimeValue,
  Csb,
  ProductRefLlk,
  PenParametric
}