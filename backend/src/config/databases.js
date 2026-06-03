import env from "./env.js"
import { Sequelize } from 'sequelize'

const sequelize = new Sequelize(
  env.db.database,
  env.db.username,
  env.db.password,
  env.db
)
export default sequelize;