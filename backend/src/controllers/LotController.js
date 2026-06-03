import BaseController from './_BaseController.js';
// import Lot from '../models/Lot.js';
// import Pen from '../models/Pen.js';
// import LotDefectCount from '../models/LotDefectCount.js';

// import { Op } from "sequelize";

class LotController extends BaseController {
    async getLots() {
        let resp = await this.checkClient();
        if (!resp) return;
        const {lineType, lineNumber, source} = this.clientCustomer;

    }
}

export default LotController;