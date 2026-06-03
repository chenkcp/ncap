import BaseController from './_BaseController.js'
import LotComment from '../models/LotComment.js'

class LotCommentController extends BaseController {
    async getCommentsByLot() {
        let resp = await this.checkClient();
        if (!resp) return;
        const {lineType, lineNumber, source} = this.clientCustomer;
        const lotId = this.query.lotId;
        const comments = await LotComment.findAll({
            where: { lineType, lineNumber, source, lotId },
            order: [['commentDate', 'DESC']],
            limit: 20
        });
        this.renderJson({comments});
    }
}

export default LotCommentController;