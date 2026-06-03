import BaseController from './_BaseController.js'
import Pen from '../models/Pen.js'
import PenDefect from '../models/PenDefect.js'

class PenController extends BaseController {
    async getPensByLot() {
        let resp = await this.checkClient();
        if (!resp) return;
        const {lineType, lineNumber, source} = this.clientCustomer;
        const lotId = this.query.lotId;

        // query pens with join penDefect
        const pens = await Pen.findAll({
            where: { lineType, lineNumber, source, lotId },
            order: [['birthday', 'DESC']],
            limit: 20,
            include: [{
                model: PenDefect,
                as: 'defects',
                required: false
            }]
        });
        this.renderJson({pens});
    }
}

export default PenController;