/** 

 * Node.js translation of VB6: T2X_Gen1LPQQA(ThisLot, strAction, intN) 

 * 

 * Notes: 

 * - This keeps the same branching and outcomes (FOW/RED/YELLOW/GREEN + CLT send + error handling). 

 * - You must provide the dependencies (registry, db, clt, runtime, server, capmainFactory). 

 * - ThisLot is assumed to be an object exposing methods similar to VB6 clsLot: 

 *    - lotId (string), birthday (Date/string), qualityStatus (string) 

 *    - letQualityStatus(status) 

 *    - item(category).count 

 *    - defectCount(code, subcode) -> number 

 *    - lotManager: { lineType, lineNumber, addComment(lotId,birthday,comment,user) } 

 * 

 * VB6 "intN" is not used in the original code, kept for signature parity. 

 */ 

 

const path = require("path"); 

const { execFile } = require("child_process"); 

const { promisify } = require("util"); 

const execFileAsync = promisify(execFile); 

 

async function ProductMonitor(thisLot, strAction, intN, deps) { 

  const { 

    registry,          // { get(app, section, key, defaultVal?), set(app, section, key, val) } 

    db,                // { queryPenWeight(penId) -> number|null } (or return { dbl_param_vl } ) 

    clt,               // { isReady(): boolean, sendGroupTestStatus(args...) }发送队列消息到 Microsoft MSMQ 

    runtime,           // { getItemQuietly(key): string } 

    server,            // { serverMessage(msg) } 将该脚本生成的消息返回给调用服务器，以便在 UI 中展示 

    capmainFactory,    // { create(): { context?: { runType?: string } } }  OR null 

    toolsDir = "c:\\program files\\nextcap\\tools", // for updFailcode.exe 

  } = deps || {}; 

 

  // VB6 locals 

  let nFunctionalCount = 0; 

  let nCriticalCount = 0; 

  let nPenCount = 0; 

  let sReason = ""; 

  let strRuntType = ""; // yes, VB6 had both strRunType/strRuntType; this one is used near CLT 

  let sProductChar = ""; 

  let sQStatus = ""; 

  let strGroup_id = ""; 

  let strTest_status = ""; 

  let iReason_code = 0; 

  let iPass_count = 0; 

  let strUser_def_1 = ""; 

  let strUser_def_2 = ""; 

  let queueKey = 1; 

  let strStationID = ""; 

  let intLineNumber = 0; 

  let strPartialLineType = ""; 

  let strLotComments = ""; 

 

  // Helper to mimic VB6 Item("Functional").Count etc. 

  function lotItemCount(name) { 

    const it = thisLot.item?.(name); 

    if (it && typeof it.count === "number") return it.count; 

    // alternatively allow thisLot.items[name].count 

    const alt = thisLot.items?.[name]; 

    if (alt && typeof alt.count === "number") return alt.count; 

    return 0; 

  } 

 

  // Helper: critical counts exactly as VB6 

  function computeCriticalCount() { 

    return ( 

      (thisLot.defectCount?.("FIT", "%") ?? 0) + 

      (thisLot.defectCount?.("FWT", "%") ?? 0) + 

      (thisLot.defectCount?.("FPQ", "FDL") ?? 0) + 

      (thisLot.defectCount?.("FVL", "FVD") ?? 0) + 

      (thisLot.defectCount?.("FVL", "FVL") ?? 0) + 

      (thisLot.defectCount?.("FVL", "FVM") ?? 0) + 

      (thisLot.defectCount?.("FVL", "FVT") ?? 0) 

    ); 

  } 

 

  function computeHeliumLeakCount() { 

    return thisLot.defectCount?.("RHL", "%") ?? 0; 

  } 

 

  async function runUpdFailcode(penId, cls, station, code) { 

    // VB6: Shell "...\updFailcode.exe " & sPenID & " Functional FWT FLW" 

    const exe = path.join(toolsDir, "updFailcode.exe"); 

    try { 

      await execFileAsync(exe, [String(penId), String(cls), String(station), String(code)], { 

        windowsHide: true, 

      }); 

    } catch (e) { 

      // Keep behavior tolerant, but log it 

      server?.serverMessage?.(`updFailcode.exe failed for ${penId}: ${e.message}`); 

    } 

  } 

 

  function addSystemComment(reason) { 

    if (!reason) return; 

    try { 

      if (thisLot.lotManager && typeof thisLot.lotManager.addComment === "function") { 

        thisLot.lotManager.addComment(thisLot.lotId, thisLot.birthday, reason, "SYSTEM"); 

      } 

    } catch (e) { 

      // swallow like VB6 would 

    } 

    server?.serverMessage?.(`Lot${thisLot.lotId} Failed ${reason}`); 

  } 

 

  function setStatus(status) { 

    if (typeof thisLot.letQualityStatus === "function") thisLot.letQualityStatus(status); 

    else thisLot.qualityStatus = status; 

  } 

 

  async function gotoFOW() { 

    if (sReason) addSystemComment(sReason); 

    setStatus("100-Percent"); 

    await doCLT(); 

  } 

 

  async function gotoRED() { 

    if (sReason) addSystemComment(sReason); 

    setStatus("Red"); 

    await doCLT(); 

  } 

 

  async function gotoINPROCESS() { 

    setStatus("Yellow"); 

    await doCLT(); 

  } 

 

  async function gotoGREEN() { 

    setStatus("Green"); 

    await doCLT(); 

  } 

 

  async function doCLT() { 

    // VB6: If strAction = "LotClosed" Or strAction = "PenAdded" Then ... 

    if (!(strAction === "LotClosed" || strAction === "PenAdded")) return; 

 

    if (!strRuntType) return; // VB6 required Len(strRuntType) > 0 

    // VB6 had commented gating to PRODUCTION only, so we do not gate. 

 

    const cltServerId = runtime?.getItemQuietly?.("CLTServerID"); 

    const cltReady = (cltServerId && cltServerId !== "Undefined" && cltServerId !== "") && clt?.isReady?.(); 

    if (!cltReady) return; 

 

    strGroup_id = String(thisLot.lotId || "").trim(); 

 

    // Resolve test status for LotClosed. For PenAdded it stays "IN Process" 

    strTest_status = "IN Process"; 

    if (strAction === "LotClosed") { 

      const qs = thisLot.qualityStatus; 

      if (qs === "Pass" || qs === "Green") strTest_status = "PASS"; 

      else if (qs === "Yellow") strTest_status = "IN Process"; 

      else if (qs === "100-Percent" || qs === "Red") strTest_status = "FAIL"; 

    } 

 

    iReason_code = 0; 

    iPass_count = 0; 

    strUser_def_1 = ""; 

    strUser_def_2 = ""; 

    queueKey = 1; 

 

    intLineNumber = 0; 

    strPartialLineType = ""; 

    if (thisLot.lotManager) { 

      intLineNumber = thisLot.lotManager.lineNumber ?? 0; 

      const lt = thisLot.lotManager.lineType ?? ""; 

      strPartialLineType = lt ? String(lt).substring(0, 1) : ""; 

    } 

 

    // VB6 final value: strStationID = intLineNumber & "_Z3-CPM" 

    strStationID = `${intLineNumber}_Z3-CPM`; 

    queueKey = 1; 

 

    await clt.sendGroupTestStatus( 

      queueKey, 

      strStationID, 

      strGroup_id, 

      strTest_status, 

      iReason_code, 

      iPass_count, 

      strUser_def_1, 

      strUser_def_2 

    ); 

  } 

 

  try { 

    // VB6: If LotManager is Nothing then set to go_ActiveLotManager 

    // In Node you can inject default lot manager before calling if needed. 

 

    // VB6: If LotClosed Or PenAdded then check CAPmain context RunType 

    if (strAction === "LotClosed" || strAction === "PenAdded") { 

      const cap = capmainFactory?.create?.(); 

      const ctx = cap?.context; 

      const rt = ctx?.runType; 

      if (rt != null) strRuntType = String(rt); 

    } 

 

    // VB6: sProductChar = UCase(Mid(ThisLot.LotID, 5, 2)) 

    const lotId = String(thisLot.lotId || ""); 

    // VB6 Mid is 1-based. Mid(lotId,5,2) => JS slice(4,6) 

    sProductChar = lotId.slice(4, 6).toUpperCase(); 

 

    // VB6: On LotReopened or LotCreated store ProductChar 

    if (strAction === "LotReopened" || strAction === "LotCreated") { 

      registry?.set?.("NextCap", "Lot", "ProductChar", sProductChar); 

    } 

 

    // VB6: If LotCreated then INPROCESS_LOT 

    if (strAction === "LotCreated") { 

      await gotoINPROCESS(); 

      return; 

    } 

 

    // VB6: PenAdded branch is special and may go FOW/RED/GREEN 

    if (strAction === "PenAdded") { 

      sQStatus = thisLot.qualityStatus; 

 

      // If already 100-Percent, go FOW 

      if (sQStatus === "100-Percent") { 

        await gotoFOW(); 

        return; 

      } 

 

      // Else, try to evaluate Ink Weight for last pen (from registry) 

      // VB6 reads: 

      //  sPenID = GetSetting("Nextcap","LastPen","PenID") 

      //  sWeight_Low = GetSetting("Nextcap","LastPen","weight_lsl") 

      //  sWeight_Upp = GetSetting("Nextcap","LastPen","weight_usl") 

      const sPenID = registry?.get?.("Nextcap", "LastPen", "PenID", ""); 

      const sWeight_Low = registry?.get?.("Nextcap", "LastPen", "weight_lsl", ""); 

      const sWeight_Upp = registry?.get?.("Nextcap", "LastPen", "weight_usl", ""); 

 

      const weightLow = Number(sWeight_Low); 

      const weightUpp = Number(sWeight_Upp); 

 

      // Query pen weight from DB 

      let weight = null; 

      if (db?.queryPenWeight) { 

        weight = await db.queryPenWeight(sPenID); 

      } 

 

      if (weight != null && !Number.isNaN(Number(weight))) { 

        const w = Number(weight); 

        registry?.set?.("Nextcap", "LastPen", "InkWeight", String(w)); 

 

        if (!Number.isNaN(weightLow) && w < weightLow) { 

          await runUpdFailcode(sPenID, "Functional", "FWT", "FLW"); 

          sReason = `- Pen ${sPenID} is Under Weight!`; 

          await gotoFOW(); 

          return; 

        } 

 

        if (!Number.isNaN(weightUpp) && w > weightUpp) { 

          await runUpdFailcode(sPenID, "Functional", "FWT", "FOW"); 

          sReason = `- Pen ${sPenID} is Over Weight!`; 

          await gotoFOW(); 

          return; 

        } 

 

        // Pen is within specs, do functional/critical check 

        nPenCount = 

          lotItemCount("Functional") + 

          lotItemCount("Risk") + 

          lotItemCount("Cosmetic") + 

          lotItemCount("Good"); 

        nFunctionalCount = lotItemCount("Functional"); 

        nCriticalCount = computeCriticalCount(); 

        const nHeliumLeakCount = computeHeliumLeakCount(); 

 

        if (nFunctionalCount >= 3 || nCriticalCount > 0 || nHeliumLeakCount > 0) { 

          sReason = `Number Criticals:${nCriticalCount} Number Functionals: ${nFunctionalCount}`; 

          await gotoRED(); 

          return; 

        } else { 

          await gotoGREEN(); 

          return; 

        } 

      } else { 

        // No weight data, do check without helium leak in this branch (matches VB6) 

        nPenCount = 

          lotItemCount("Functional") + 

          lotItemCount("Risk") + 

          lotItemCount("Cosmetic") + 

          lotItemCount("Good"); 

        nFunctionalCount = lotItemCount("Functional"); 

        nCriticalCount = computeCriticalCount(); 

 

        if (nFunctionalCount >= 3 || nCriticalCount > 0) { 

          sReason = `Number Criticals:${nCriticalCount} Number Functionals: ${nFunctionalCount}`; 

          await gotoRED(); 

          return; 

        } else { 

          await gotoGREEN(); 

          return; 

        } 

      } 

    } 

 

    // VB6: LotClosed with <1 pen => INPROCESS 

    if (strAction === "LotClosed") { 

      nPenCount = 

        lotItemCount("Functional") + 

        lotItemCount("Risk") + 

        lotItemCount("Cosmetic") + 

        lotItemCount("Good"); 

      if (nPenCount < 1) { 

        await gotoINPROCESS(); 

        return; 

      } 

    } 

 

    // VB6: actions that recalc lot status 

    const recalcActions = new Set(["PenDeleted", "LotClosed", "LotReopened", "PenUpdated"]); 

    if (recalcActions.has(strAction)) { 

      sQStatus = thisLot.qualityStatus; 

 

      if (sQStatus === "100-Percent") { 

        sReason = "because it is an FOW/FLW Lot"; 

        await gotoFOW(); 

        return; 

      } 

 

      nPenCount = 

        lotItemCount("Functional") + 

        lotItemCount("Risk") + 

        lotItemCount("Cosmetic") + 

        lotItemCount("Good"); 

      nFunctionalCount = lotItemCount("Functional"); 

      nCriticalCount = computeCriticalCount(); 

 

      if (nFunctionalCount >= 3 || nCriticalCount > 0) { 

        sReason = `Number Criticals:${nCriticalCount} Number Functionals: ${nFunctionalCount}`; 

        await gotoRED(); 

        return; 

      } else { 

        await gotoGREEN(); 

        return; 

      } 

    } 

 

    // If none matched, do nothing (VB6 would just fall through) 

  } catch (err) { 

    // VB6 EH: 

    strLotComments = `Quality Monitor CSB ${err?.number ?? ""} ${err?.message ?? String(err)}`.trim(); 

    try { 

      if (thisLot.lotManager?.addComment) { 

        thisLot.lotManager.addComment(thisLot.lotId, thisLot.birthday, strLotComments, "SYSTEM"); 

      } 

    } catch (_) {} 

    server?.serverMessage?.(strLotComments); 

    setStatus("Blue"); 

  } 

} 

 

module.exports = { ProductMonitor }; 