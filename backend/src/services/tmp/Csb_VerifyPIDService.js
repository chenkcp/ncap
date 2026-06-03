/** 

 * Node.js translation of VB6: 

 * Function VerifyId(ID) As Boolean 

 * 

 * What this does (same logic as VB): 

 * 1) Validate PID length = 16 

 * 2) If RunType === "Production": check local DB PENS table to see if PID already exists 

 *    (excluding SyncState REMOVE/DELETE). If exists, fail and include the lotId in message. 

 * 3) Query DB (product_ref_llk) by PartNumber to get expected rules: 

 *    - mid_cd, lotid_cd, pica_cd, prod_gen_cd 

 * 4) Check first 4 chars of PID is included in mid_cd 

 * 5) Check lot product char (saved setting "Nextcap\\Lot\\ProductChar") matches expected lotid_cd 

 *    unless RunType === "Engineering" 

 * 

 */ 

 

/** 

 * @typedef {Object} LocalDb 

 * @property {(sql:string, params?:any[])=>Promise<{rows:any[]}>} query 

 * 

 * @typedef {Object} MfgDb 

 * @property {(sql:string, params?:any[])=>Promise<{rows:any[]}>} query 

 * 

 * @typedef {Object} SettingsStore 

 * @property {(app:string, section:string, key:string)=>Promise<string|null>|string|null} getSetting 

 * 

 * @typedef {Object} VerifyContext 

 * @property {"Production"|"Engineering"|string} runType 

 * @property {string} partNumber 

 * @property {LocalDb} localDb 

 * @property {MfgDb} [mfgDb] - Optional mock database for testing 

 * @property {Object} [dbConnection] - Optional database connection object 

 * @property {SettingsStore} settings 

 */ 

 

/** 

 * @param {string} penId 

 * @param {VerifyContext} ctx 

 * @returns {Promise<{ok:boolean, message?:string, code?:string, details?:any}>} 

 */ 

async function verifyId(penId, ctx) { 

  try { 

    const id = String(penId ?? ""); 

 

    // VB: VerifyId = True initially 

    // 1) Length check 

    if (id.length !== 16) { 

      return { 

        ok: false, 

        code: "INVALID_LENGTH", 

        message: "Invalid pen id length! Please rescan the pen.", 

      }; 

    } 

 

    // 2) If Production: check existing pen in local DB 

    if (ctx.runType === "Production") { 

      // VB SQL: 

      // SELECT LotID FROM PENS WHERE PenID='...' AND SyncState<>'REMOVE' AND SyncState<>'DELETE' 

      const sql = ` 

        SELECT LotID 

        FROM PENS 

        WHERE PenID = ? 

          AND SyncState <> 'REMOVE' 

          AND SyncState <> 'DELETE' 

      `; 

       

      try { 

        let rows; 

        if (ctx.dbConnection && ctx.dbConnection.isConfigured && ctx.dbConnection.isConfigured()) { 

          console.log('[verifyId] Using real database connection for local DB check'); 

          const result = await ctx.dbConnection.queryWithNamedParams( 

            'SELECT LotID FROM PENS WHERE PenID = @penId AND SyncState <> \'REMOVE\' AND SyncState <> \'DELETE\'', 

            { penId: id } 

          ); 

          rows = result.rows; 

        } else if (ctx.localDb) { 

          console.log('[verifyId] Using mock local database'); 

          const result = await ctx.localDb.query(sql, [id]); 

          rows = result.rows; 

        } else { 

          rows = []; 

        } 

         

        if (rows.length > 0) { 

          const lotId = rows[0].LotID ?? rows[0].lotid ?? rows[0].lotId; 

          return { 

            ok: false, 

            code: "ALREADY_IN_LOT", 

            message: 

              `Warning - Pen ${id} has already been entered into lot ${lotId}.` + 

              `\n\nTo edit this pen, enter the PID again and press the edit button.`, 

            details: { lotId }, 

          }; 

        } 

      } catch (err) { 

        console.error('[verifyId] Local database query failed:', err.message); 

        // Continue with validation even if local DB check fails 

      } 

    } 

 

    // 3) Query MFG DB for product rules 

    // VB: SELECT * from product_ref_llk where inv_item_lk_nr='PartNumber' 

    let prodRows = []; 

    try { 

      if (ctx.dbConnection && ctx.dbConnection.isConfigured && ctx.dbConnection.isConfigured()) { 

        console.log('[verifyId] Using real database connection for MFG DB check'); 

        const result = await ctx.dbConnection.queryWithNamedParams( 

          'SELECT mid_cd, lotid_cd, pica_cd, prod_gen_cd FROM product_ref_llk WHERE inv_item_lk_nr = @partNumber', 

          { partNumber: ctx.partNumber } 

        ); 

        prodRows = result.rows; 

      } else if (ctx.mfgDb) { 

        console.log('[verifyId] Using mock MFG database'); 

        const productSql = ` 

          SELECT mid_cd, lotid_cd, pica_cd, prod_gen_cd 

          FROM product_ref_llk 

          WHERE inv_item_lk_nr = ? 

        `; 

        const result = await ctx.mfgDb.query(productSql, [ctx.partNumber]); 

        prodRows = result.rows; 

      } 

    } catch (err) { 

      console.error('[verifyId] MFG database query failed:', err.message); 

      prodRows = []; 

    } 

 

    if (prodRows.length === 0) { 

      return { 

        ok: false, 

        code: "UNKNOWN_PRODUCT", 

        message: "The product type is not recognised!.  Contact Support.", 

      }; 

    } 

 

    const rule = prodRows[0]; 

    const sCorrectMIDCode = String(rule.mid_cd ?? ""); 

    const sCorrectLotIDCode = String(rule.lotid_cd ?? ""); 

    const sCorrectVentLabelChar = String(rule.pica_cd ?? ""); // kept for parity, not used further in VB snippet 

    const sProductGeneration = String(rule.prod_gen_cd ?? ""); // kept for parity, not used further in VB snippet 

 

    // 4) MID check: sId = Left(ID,4), InStr(sCorrectMIDCode, sId) <= 0 => fail 

    const sId = id.slice(0, 4); 

    if (!sCorrectMIDCode.includes(sId)) { 

      return { 

        ok: false, 

        code: "MID_MISMATCH", 

        message: 

          "The product type is not set correctly for this pen!!! Use the Context menu to change the part type.", 

        details: { expectedMidCd: sCorrectMIDCode, penPrefix: sId }, 

      }; 

    } 

 

    // 5) Lot product char check (unless Engineering) 

    const lotProductChar = 

      (await Promise.resolve(ctx.settings.getSetting("Nextcap", "Lot", "ProductChar"))) ?? ""; 

    if ( 

      ctx.runType !== "Engineering" && 

      String(lotProductChar).toUpperCase() !== String(sCorrectLotIDCode).toUpperCase() 

    ) { 

      return { 

        ok: false, 

        code: "LOTID_FORMAT_MISMATCH", 

        message: 

          "You have the Incorrect LotID format for this product.  Use the Undo button to delete the lot and create a new one with the correct product identifier.", 

        details: { lotProductChar, expectedLotIdCd: sCorrectLotIDCode }, 

      }; 

    } 

 

    // Success 

    return { 

      ok: true, 

      details: { 

        mid_cd: sCorrectMIDCode, 

        lotid_cd: sCorrectLotIDCode, 

        pica_cd: sCorrectVentLabelChar, 

        prod_gen_cd: sProductGeneration, 

      }, 

    }; 

  } catch (err) { 

    // VB EH: MsgBox Err.Description, vbCritical, "Contact Support" 

    return { 

      ok: false, 

      code: "ERROR", 

      message: (err && err.message) ? err.message : "Contact Support", 

      details: { error: String(err) }, 

    }; 

  } 

} 

 

module.exports = { verifyId }; 
