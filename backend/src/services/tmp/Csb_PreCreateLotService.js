/** 

 * Node.js translation of VB6: 

 * Function PreCreateLot(LotId As String) As String 

 * 

 * VB behavior: 

 * - If LotId length is 10 or 11: 

 *   - Extract trailing count: Right(LotId, 4) or Right(LotId, 5) 

 *   - If first 2 chars of that are numeric: save Count = those 2 chars 

 *   - Extract build date: Left(LotId, 4) and save LastDate 

 * - Always returns LotId 

 * 

 * This version expects a settings adapter so you can map it to: 

 * - Windows Registry 

 * - JSON config file 

 * - DB table 

 * - in-memory store for tests 

 */ 

 

/** 

 * @typedef {Object} SettingsStore 

 * @property {(app:string, section:string, key:string, value:string)=>Promise<void>|void} saveSetting 

 */ 

 

/** 

 * @param {string} lotId 

 * @param {SettingsStore} settings 

 * @returns {Promise<string>} lotId 

 */ 

async function preCreateLot(lotId, settings) { 

  const csApp = "NextCap"; 

  const csSection = "Lot"; 

 

  const id = String(lotId ?? ""); 

 

  // VB: If Len(LotId) = 10 Or Len(LotId) = 11 Then 

  if (id.length === 10 || id.length === 11) { 

    // VB: sLotCount = Right(LotId, 5) or Right(LotId, 4) 

    const sLotCountRaw = id.slice(-(id.length === 11 ? 5 : 4)); 

 

    // VB: If IsNumeric(Left(sLotCount, 2)) Then ... 

    const first2 = sLotCountRaw.slice(0, 2); 

    if (/^\d{2}$/.test(first2)) { 

      // VB saved only the first 2 digits 

      await settings.saveSetting(csApp, csSection, "Count", first2); 

    } 

 

    // VB: sCurrentDate = Left(LotId, 4) 

    const sCurrentDate = id.slice(0, 4); 

    await settings.saveSetting(csApp, csSection, "LastDate", sCurrentDate); 

  } 

 

  // VB: PreCreateLot = LotId 

  return id; 

} 

 

module.exports = { preCreateLot }; 