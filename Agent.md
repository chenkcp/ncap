# AGENTS.md (root)
You are a senior data engineer + manufacturing domain expert.

Your task is to design a complete WORK ORDER analysis solution based on a manufacturing database that contains multiple processes and multiple related tables.

### Context:
- The manufacturing system has multiple stages , THE FALCAP test is audit statistic test by WORK_ORDER_ID, these data used in the test is supplied by  PPF.PROCESS_STEP_DIM_KY = 2129 cl_* process and 2130 hue2_* process recorded in RPTDS.PEN_PROCESS_FACT table,
- the work_order_id is recorded in  rptds.work_order_dim table , each work_order_id has more than one pn_id, the pn_id is the production product which is being tested by cl_* and hue_* processes , the result of these test is staged in rptds.pen_slot_fact table
- Thew audit requirement is defined in FCEOLQT_TEST_CRITERIA_DIM CRITERIA
- each pn_id is a physical part sampled in the work_order, and each pn_id is a ink cartrige which has ink_type, arch_id, pro_color_dim_ky etc which determined what is the falcap test to used
- the falcap test will need to complete for the steps defined in  FCEOLQT_WO_TEST_CNSTR_DIM_KY in RPTDS.FCEOLQT_WO_TEST_CNSTR_DIM
- the completed falcap test will be recorded in RPTDS.FCEOLQT_WO_RESULT_FACT

### Your Objectives:

#### 1. Data Understanding
- check if the work_order_id has the falcap result in  RPTDS.FCEOLQT_WO_RESULT_FACT, if not test result then identify where in the data model is causing the falcap test to be unsuccessful
- Handle missing or inconsistent data.

#### 2. Data Modeling
- Create a logical data model (star schema or normalized if needed).
- Define how to combine multi-process data into a unified work order lifecycle view.

#### 3. Tables Design
CREATE TABLE rptds.work_order_dim ( work_order_id varchar(20) NOT NULL, work_order_status_nm varchar(40) NULL, work_order_open_dm timestamp(0) NULL, work_order_start_dm timestamp(0) NULL, work_order_close_dm timestamp(0) NULL, work_order_run_type_nm varchar(40) NULL, dry_pn_fg bpchar(1) NULL, wet_pn_fg bpchar(1) NULL, on_hold_fg bpchar(1) NULL, misprocessed_fg bpchar(1) NULL, pn_expected_start_ct numeric NULL, pn_start_ct numeric NULL, pn_out_ct numeric NULL, pn_delivered_ct numeric NULL, update_user_id varchar(32) NULL, update_dm timestamp(0) NULL, comment_tx varchar(255) NULL, inv_item_dim_ky numeric NULL, inv_item_nr varchar(40) NULL, inv_item_rpt_nm varchar(40) NULL, prodphase_nm varchar(40) NULL, work_order_dest_nm varchar(40) NULL, affects_yield_fg bpchar(1) NULL, prod_family_nm varchar(40) NULL, work_order_priority_nm varchar(40) NULL, prod_family_dim_ky numeric NULL, run_type_dim_ky numeric NULL, work_order_dest_dim_ky numeric NULL, work_order_priority_dim_ky numeric NULL, prodphase_dim_ky numeric NULL, CONSTRAINT work_order_dim_pk_idx PRIMARY KEY (work_order_id));

CREATE TABLE rptds.pen_slot_fact ( pn_id varchar(100) NOT NULL, die_site_nr numeric NOT NULL, slot_dim_ky numeric NOT NULL, die_info_dim_ky numeric NULL, inv_item_dim_ky numeric NULL, prod_color_dim_ky numeric NULL, nht_part_dt_dim_ky numeric NULL, nht_part_dm timestamp(0) NULL, nht_reclaim_ct numeric NULL, nht_missing_noz_ct numeric NULL, nht_cons_aberrant_noz_ct numeric NULL, cap_insp_scan_dt_dim_ky numeric NULL, cap_insp_scan_dm timestamp(0) NULL, cap_insp_missing_noz_ct numeric NULL, cap_insp_weak_noz_ct numeric NULL, cap_insp_weak_noz_strength_av numeric NULL, cap_insp_weak_noz_strength_sd numeric NULL, cap_insp_weak_noz_strength_mx numeric NULL, cap_insp_weak_noz_strength_mi numeric NULL, cap_insp_noz_vt1err_ct numeric NULL, cap_insp_noz_vt2err_ct numeric NULL, cap_insp_noz_vt3err_ct numeric NULL, cap_insp_left_raggedness_vl numeric NULL, cap_insp_right_raggedness_vl numeric NULL, cap_insp_overall_raggedness_vl numeric NULL, cap_clou_test_dt_dim_ky numeric NULL, cap_clou_test_dm timestamp(0) NULL, cap_clou_sad_mean_sep_deg_vl numeric NULL, cap_clou_she_deg_av numeric NULL, cap_clou_drop_size_mic_av numeric NULL, cap_clou_drop_size_mic_sd numeric NULL, cap_clou_drop_shape_av numeric NULL, cap_clou_drop_shape_sd numeric NULL, hue_test_dt_dim_ky numeric NULL, hue_test_dm timestamp(0) NULL, hue_astar_av numeric NULL, hue_astar_sd numeric NULL, hue_astar_mx numeric NULL, hue_astar_mi numeric NULL, hue_bstar_av numeric NULL, hue_bstar_sd numeric NULL, hue_bstar_mx numeric NULL, hue_bstar_mi numeric NULL, hue_lstar_av numeric NULL, hue_lstar_sd numeric NULL, hue_lstar_mx numeric NULL, hue_lstar_mi numeric NULL, ink_type_dim_ky numeric NULL, ink_nm varchar(40) NULL, cap_insp_left_sharpness_vl numeric NULL, cap_insp_right_sharpness_vl numeric NULL, ink_lot_nm varchar(40) NULL, cap_clou_r2l_test_dt_dim_ky numeric NULL, cap_clou_r2l_test_dm timestamp(0) NULL, cap_clou_r2lsad_meansepdeg_vl numeric NULL, cap_clou_r2l_she_deg_av numeric NULL, cap_clou_r2l_drop_size_mic_av numeric NULL, cap_clou_r2l_drop_size_mic_sd numeric NULL, cap_clou_r2l_drop_shape_av numeric NULL, cap_clou_r2l_drop_shape_sd numeric NULL, cap_clou_l2r9_test_dt_dim_ky numeric NULL, cap_clou_l2r9_test_dm timestamp(0) NULL, cap_clou_l2r9sad_meansepdeg_vl numeric NULL, cap_clou_l2r9_she_deg_av numeric NULL, cap_clou_l2r9_drop_size_mic_av numeric NULL, cap_clou_l2r9_drop_size_mic_sd numeric NULL, cap_clou_l2r9_drop_shape_av numeric NULL, cap_clou_l2r9_drop_shape_sd numeric NULL, cap_clou_l2r18_test_dt_dim_ky numeric NULL, cap_clou_l2r18_test_dm timestamp(0) NULL, cap_clou_l2r18sadmeansepdeg_vl numeric NULL, cap_clou_l2r18_she_deg_av numeric NULL, cap_clou_l2r18drop_size_mic_av numeric NULL, cap_clou_l2r18drop_size_mic_sd numeric NULL, cap_clou_l2r18_drop_shape_av numeric NULL, cap_clou_l2r18_drop_shape_sd numeric NULL, cap_clou_l2r36_test_dt_dim_ky numeric NULL, cap_clou_l2r36_test_dm timestamp(0) NULL, cap_clou_l2r36sadmeansepdeg_vl numeric NULL, cap_clou_l2r36_she_deg_av numeric NULL, cap_clou_l2r36drop_size_mic_av numeric NULL, cap_clou_l2r36drop_size_mic_sd numeric NULL, cap_clou_l2r36_drop_shape_av numeric NULL, cap_clou_l2r36_drop_shape_sd numeric NULL, segue_test_dt_dim_ky numeric NULL, segue_test_dm timestamp(0) NULL, segue_toe_vl numeric NULL, segue_dwss_toe_vl numeric NULL, segue_dwss_ndrop_vl numeric NULL, nht_run_type_dim_ky numeric NULL, cap_insp_exprmt_tx varchar(20) NULL, cap_insp_comment_tx varchar(255) NULL, hue_experiment_id varchar(20) NULL, cap_clou_exprmt_tx varchar(30) NULL, cap_clou_printer_id varchar(10) NULL, cap_clou_comment_tx varchar(80) NULL, cap_clou_r2l_exprmt_tx varchar(30) NULL, cap_clou_r2l_printer_id varchar(10) NULL, cap_clou_r2l_comment_tx varchar(80) NULL, cap_clou_l2r9_exprmt_tx varchar(30) NULL, cap_clou_l2r9_printer_id varchar(10) NULL, cap_clou_l2r9_comment_tx varchar(80) NULL, cap_clou_l2r18_exprmt_tx varchar(30) NULL, cap_clou_l2r18_printer_id varchar(10) NULL, cap_clou_l2r18_comment_tx varchar(80) NULL, cap_clou_l2r36_exprmt_tx varchar(30) NULL, cap_clou_l2r36_printer_id varchar(10) NULL, cap_clou_l2r36_comment_tx varchar(80) NULL, delta_e_vl numeric NULL, hue2_test_dt_dim_ky numeric NULL, hue2_test_dm timestamp(0) NULL, hue2_astar_av numeric NULL, hue2_astar_sd numeric NULL, hue2_astar_mx numeric NULL, hue2_astar_mi numeric NULL, hue2_bstar_av numeric NULL, hue2_bstar_sd numeric NULL, hue2_bstar_mx numeric NULL, hue2_bstar_mi numeric NULL, hue2_lstar_av numeric NULL, hue2_lstar_sd numeric NULL, hue2_lstar_mx numeric NULL, hue2_lstar_mi numeric NULL, hue2_experiment_id varchar(20) NULL, delta_e_vl_2 numeric NULL, clous_print_sample_date_time timestamp(0) NULL, work_order_id varchar(20) NOT NULL, arch_id numeric NULL, odd_ink_type_nm varchar(50) NULL, odd_ink_color_nm varchar(50) NULL, even_ink_type_nm varchar(50) NULL, even_ink_color_nm varchar(50) NULL, slot_cd varchar(3) NULL, ink_type_cd varchar(3) NULL, prod_color_cd varchar(3) NULL, insert_ts timestamp(0) DEFAULT CURRENT_TIMESTAMP NOT NULL, modified_ts timestamp(0) NULL, CONSTRAINT pen_slot_fact_pkey PRIMARY KEY (pn_id,die_site_nr,slot_dim_ky));


CREATE TABLE rptds.pen_process_fact ( pn_id varchar(100) NOT NULL, process_step_dim_ky numeric NOT NULL, unit_process_dim_ky numeric NOT NULL, functional_process_dim_ky numeric NOT NULL, reclaim_ct numeric NULL, station_dim_ky numeric NULL, module_dim_ky numeric NULL, island_dim_ky numeric NULL, zone_dim_ky numeric NULL, line_dim_ky numeric NULL, last_pass_fg bpchar(1) NULL, work_order_id varchar(20) NULL, inv_item_dim_ky numeric NULL, run_type_dim_ky numeric NULL, date_day_dim_ky numeric NULL, pn_eq_start_dm timestamp(0) NOT NULL, pn_eq_end_dm timestamp(0) NULL, shift_dim_ky numeric NULL, failure_dim_ky numeric NULL, in_ct numeric NULL, irs_failure_ct numeric NULL, functional_failure_ct numeric NULL, prodphase_dim_ky numeric NULL, affects_yield_fg bpchar(1) NULL, detail_state_dim_ky numeric NULL, minor_state_dim_ky numeric NULL, major_state_dim_ky numeric NULL);

CREATE TABLE rptds.inv_item_dim ( inv_item_dim_ky numeric NOT NULL, inv_item_nr varchar(40) NULL, prod_subfamily_nm varchar(40) NULL, prod_family_nm varchar(40) NULL, prod_group_nm varchar(40) NULL, prod_tech_nm varchar(40) NULL, part_type_nm varchar(40) NULL, active_fg bpchar(1) NULL, update_dm timestamp(0) NULL, update_user_id varchar(32) NULL, inv_item_dn varchar(100) NULL, prodphase_dim_ky numeric NULL, inv_item_rpt_nm varchar(40) NULL, prod_family_dim_ky numeric NULL, CONSTRAINT inv_item_dim_pk_idx PRIMARY KEY (inv_item_dim_ky));


CREATE TABLE rptds.ink_type_dim ( ink_type_dim_ky numeric NOT NULL, ink_type_nm varchar(40) NULL, ink_type_cd varchar(5) NULL, active_fg bpchar(1) NULL, update_dm timestamp(0) NULL, update_user_id varchar(32) NULL, ink_type_dn varchar(100) NULL, CONSTRAINT ink_type_dim_pk_idx PRIMARY KEY (ink_type_dim_ky));

CREATE TABLE rptds.ink_type_prod_color_dim ( ink_type_dim_ky numeric NOT NULL, prod_color_dim_ky numeric NOT NULL, active_fg bpchar(1) NULL, update_dm timestamp(0) NULL, update_user_id varchar(32) NULL, ink_type_prod_color_dn varchar(100) NULL, CONSTRAINT inktype_prodclr_dim_pk_idx PRIMARY KEY (ink_type_dim_ky,prod_color_dim_ky));

CREATE TABLE rptds.die_info_dim ( die_info_dim_ky numeric NOT NULL, wafer_lot_id varchar(20) NULL, wafer_id varchar(20) NULL, die_row_nr numeric NULL, die_col_nr numeric NULL, metro_fg bpchar(1) NULL, arch_id numeric NULL, pass_fail_fg bpchar(1) NULL, CONSTRAINT die_info_dim_pk_idx PRIMARY KEY (die_info_dim_ky));

CREATE TABLE rptds.pen_yield_unit_process_fact ( pn_id varchar(100) NOT NULL, unit_process_dim_ky numeric NOT NULL, in_ct numeric NULL, irs_failure_ct numeric NULL, irs_failure_dm timestamp(0) NULL, irs_failure_date_dim_ky numeric NULL, irs_work_order_id varchar(20) NULL, irs_process_step_dim_ky numeric NULL, irs_unit_process_dim_ky numeric NULL, irs_functional_process_dim_ky numeric NULL, irs_station_dim_ky numeric NULL, irs_module_dim_ky numeric NULL, irs_island_dim_ky numeric NULL, irs_zone_dim_ky numeric NULL, irs_line_dim_ky numeric NULL, functional_failure_ct numeric NULL, functional_failure_dm timestamp(0) NULL, functional_failure_date_dim_ky numeric NULL, functional_work_order_id varchar(20) NULL, functional_process_step_dim_ky numeric NULL, functional_unit_process_dim_ky numeric NULL, functional_func_process_dim_ky numeric NULL, functional_station_dim_ky numeric NULL, functional_module_dim_ky numeric NULL, functional_island_dim_ky numeric NULL, functional_zone_dim_ky numeric NULL, functional_line_dim_ky numeric NULL, irs_failure_dim_ky numeric NULL, functional_failure_dim_ky numeric NULL, CONSTRAINT pyupf_pk_idx PRIMARY KEY (pn_id,unit_process_dim_ky));

CREATE TABLE rptds.product_color_dim ( prod_color_dim_ky numeric NOT NULL, prod_color_nm varchar(40) NULL, prod_color_cd varchar(5) NULL, active_fg bpchar(1) NULL, update_dm timestamp(0) NULL, update_user_id varchar(32) NULL, prod_color_dn varchar(100) NULL, CONSTRAINT prod_color_dim_pk_idx PRIMARY KEY (prod_color_dim_ky));

CREATE TABLE falcon.pen_info_dtl ( pn_id varchar(16) NOT NULL, arch_id numeric(38) NULL, odd_inktyplk_cd varchar(3) NULL, odd_prodcolorlk_cd bpchar(3) NULL, even_inktyplk_cd varchar(3) NULL, even_prodcolorlk_cd bpchar(3) NULL, update_dm timestamp(0) NULL, db_insert_dm timestamp(0) NULL, db_update_dm timestamp(0) NULL, CONSTRAINT pninfodtl_pk PRIMARY KEY (pn_id));


CREATE TABLE falcon.cl_main ( stamp varchar(30) NOT NULL, pq_sample_id varchar(24) NULL, exprmt varchar(40) NULL, code varchar(20) NULL, test_req_id varchar(20) NULL, test_pen_id varchar(20) NULL, pen_id varchar(20) NULL, prgm_rev varchar(20) NULL, tester_id float8 NULL, job_id varchar(20) NULL, project_id varchar(20) NULL, customer_id varchar(40) NULL, media_id varchar(20) NULL, config_file varchar(40) NULL, print_file varchar(40) NULL, print_mode varchar(20) NULL, printer_id varchar(20) NULL, date_test timestamp(0) NULL, time_test varchar(8) NULL, elapsed_time float8 NULL, test_title varchar(80) NULL, comment_tx varchar(80) NULL, data_source_id varchar(100) NULL, partition_dm timestamp(0) NULL, print_hum_vl float8 NULL, measure_hum_vl float8 NULL, print_hum_source varchar(20) NULL, measure_hum_source varchar(20) NULL, print_sample_id varchar(20) NULL, insert_dm timestamp(0) NULL, part_link_id varchar(30) NULL, update_dm timestamp(0) NULL, "comment" varchar(80) NULL, CONSTRAINT cl_main_pk_idx PRIMARY KEY (stamp));

CREATE TABLE falcon.work_order_status ( work_order_id varchar(20) NOT NULL, work_order_statuslk_ky float8 NULL, runtyplk_ky float8 NULL, work_order_open_dm timestamp(0) NULL, work_order_close_dm timestamp(0) NULL, pn_start_ct float8 NULL, pn_out_ct float8 NULL, update_dm timestamp(0) NULL, on_hold_fg bpchar(1) NULL, pn_delivered_ct float8 NULL, misprocessed_fg bpchar(1) NULL, comment_tx varchar(255) NULL, work_order_start_dm timestamp(0) NULL, pn_expected_start_ct float8 NULL, update_user_id varchar(32) NULL, invitemlk_ky float8 NULL, prodphaselk_ky numeric(38) NULL, wodestlk_ky numeric(38) NULL, affects_yield_fg bpchar(1) NULL, woprioritylk_ky numeric(38) NULL, db_insert_dm timestamp(0) NULL, db_update_dm timestamp(0) NULL, invitemlk_rpt_nm varchar(40) NULL, CONSTRAINT wo_status_pk_idx PRIMARY KEY (work_order_id));

CREATE TABLE falcon.sample_analysis ( stamp varchar(30) NULL, exprmt varchar(20) NULL, labnet_request_ky float8 NULL, job_id varchar(20) NULL, sample_id varchar(40) NULL, test_dm timestamp(0) NULL, customer_id varchar(40) NULL, station_id varchar(7) NULL, config_file_nm varchar(50) NULL, prgm_rev_tx varchar(8) NULL, meas_device_typelk_ky float8 NULL, meas_device_firmware_rev_tx varchar(12) NULL, meas_device_driver_rev_tx varchar(12) NULL, meas_device_serial_nr_tx varchar(20) NULL, comment_tx varchar(250) NULL, insert_ts timestamp(0) NULL, modified_ts timestamp(0) NULL, modified_user_nm varchar(60) NULL, data_source_id varchar(100) NULL);

CREATE TABLE rptds.fceolqt_wo_test_fact ( work_order_id varchar(20) NOT NULL, fceolqt_wo_test_cnstr_dim_ky numeric NOT NULL, pass_fail_fg bpchar(1) NULL, latest_run_dm timestamp(0) NULL, insert_ts timestamp(0) NULL, insert_user_nm varchar(60) NULL, modified_ts timestamp(0) NULL, modified_user_nm varchar(60) NULL, prod_color_cd varchar(10) NOT NULL, CONSTRAINT fc_wotestfact_pk_idx PRIMARY KEY (work_order_id, fceolqt_wo_test_cnstr_dim_ky, prod_color_cd));

CREATE TABLE rptds.fceolqt_wo_type_dim ( fceolqt_wo_type_dim_ky numeric NOT NULL, work_order_type_nm varchar(40) NULL, ink_type_dim_ky numeric NULL, arch_id varchar(8) NULL, active_fg bpchar(1) NULL, update_dm timestamp(0) NULL, update_user_id varchar(32) NULL, insert_ts timestamp(0) NULL, insert_user_nm varchar(60) NULL, modified_ts timestamp(0) NULL, modified_user_nm varchar(60) NULL, min_pen_ct int8 NULL, days_to_process_wo_ct int8 DEFAULT 5 NULL, CONSTRAINT fc_wotype_dim_pk_idx PRIMARY KEY (fceolqt_wo_type_dim_ky));

CREATE TABLE rptds.fceolqt_wo_test_cnstr_dim ( fceolqt_wo_test_cnstr_dim_ky numeric NOT NULL, fceolqt_wo_type_dim_ky numeric NOT NULL, fceolqt_test_criteria_dim_ky numeric NOT NULL, prod_color_dim_ky numeric NULL, constraint_upper_bound_vl numeric NULL, constraint_lower_bound_vl numeric NULL, constraint_centile_pct numeric NULL, active_fg bpchar(1) NULL, update_dm timestamp(0) NULL, update_user_id varchar(32) NULL, insert_ts timestamp(0) NULL, insert_user_nm varchar(60) NULL, modified_ts timestamp(0) NULL, modified_user_nm varchar(60) NULL, slot_type_cd varchar(5) NULL, CONSTRAINT fc_wotestcnstr_dim_pk_idx PRIMARY KEY (fceolqt_wo_test_cnstr_dim_ky));

CREATE TABLE rptds.fceolqt_test_criteria_dim ( fceolqt_test_criteria_dim_ky numeric NOT NULL, test_criteria_nm varchar(40) NULL, table_nm varchar(40) NULL, column_nm varchar(40) NULL, active_fg bpchar(1) NULL, update_dm timestamp(0) NULL, update_user_id varchar(32) NULL, insert_ts timestamp(0) NULL, insert_user_nm varchar(60) NULL, modified_ts timestamp(0) NULL, modified_user_nm varchar(60) NULL, CONSTRAINT fc_testcrit_dim_pk_idx PRIMARY KEY (fceolqt_test_criteria_dim_ky));

CREATE TABLE rptds.fceolqt_wo_result_fact ( fceolqt_worslt_ky numeric NOT NULL, work_order_id varchar(20) NOT NULL, status_cd bpchar(1) NULL, email_sent_fg bpchar(1) NULL, latest_run_dm timestamp(0) NULL, insert_ts timestamp(0) NULL, insert_user_nm varchar(60) NULL, modified_ts timestamp(0) NULL, modified_user_nm varchar(60) NULL, CONSTRAINT fc_woresultfact_pk_idx PRIMARY KEY (fceolqt_worslt_ky));

#### 3. Query Design
--get the WO; if any listed, then check if this list has data in 
SELECT WOD.*  FROM RPTDS.WORK_ORDER_DIM WOD, RPTDS.INV_ITEM_DIM IID 
WHERE WOD.WORK_ORDER_STATUS_NM = 'Closed' AND WOD.WORK_ORDER_DEST_NM = 'FGI' 
AND WOD.UPDATE_DM > current_date - 270 AND IID.INV_ITEM_DIM_KY = WOD.INV_ITEM_DIM_KY 
AND IID.PART_TYPE_NM not in ('DRY PEN','PEN BODY') 
AND WOD.INV_ITEM_DIM_KY NOT IN ( '240540','462037','499139','470401','520140','537036','568836','649026','692348','727567','892317' ,'763773') 
AND WOD.WORK_ORDER_ID ='4HDMORG260423D1'



-- to confirm if the WO has FALCAP results
SELECT WORK_ORDER_ID FROM RPTDS.FCEOLQT_WO_RESULT_FACT WHERE WORK_ORDER_ID IN 
('4HDMRMAG250514D2')

--get the general info OF THE WORK ORDER ID WHICH IS NEEDED IN FALCAP AUTOMATION 
select * from rptds.pen_slot_fact
where work_order_id ='0GEMLMLC260515D1' 

-- get the ink type
select * from rptds.ink_type_dim
where ink_type_dim_ky in (
   select distinct ink_type_dim_ky from rptds.pen_slot_fact
   where work_order_id ='0GEMLMLC260515D1' );

--#get wafer info on the work_order_id
select * from rptds.die_info_dim
where die_info_dim_ky in (
   select distinct die_info_dim_ky from rptds.pen_slot_fact
   where work_order_id ='0GEMLMLC260515D1' );

 /* See if this die exists in the die_info_dim table */
 SELECT  COUNT(*)
 FROM rptds.die_info_dim
 WHERE wafer_lot_id = v_wafer_lot_id AND wafer_id = v_wafer_id AND die_row_nr = v_die_row_nr AND die_col_nr = v_die_col_nr;

-- get the wafter base on the pen id used for the work_order_id
 SELECT invitemlk1_id , invitemlk2_id , invitemlk3_id::numeric , invitemlk4_id::numeric 
 From falcon.pen_link_component_v
 WHERE pn_id = '20411002607' AND position_nr = 0 AND parttypelk_ky = 1;
                

select *  FROM die_info_dim did,
    slot_dim sd,
    inv_item_dim iid,
    product_family_dim pfd,
    pen_info_dim pid
     LEFT JOIN work_order_dim wod ON wod.work_order_id::text = pid.last_work_order_id::text,
    pen_slot_fact psf
     LEFT JOIN ink_type_dim itd ON itd.ink_type_dim_ky = psf.ink_type_dim_ky
     LEFT JOIN product_color_dim pcd ON pcd.prod_color_dim_ky = psf.prod_color_dim_ky
  WHERE did.die_info_dim_ky = psf.die_info_dim_ky AND sd.slot_dim_ky = psf.slot_dim_ky AND iid.inv_item_dim_ky = psf.inv_item_dim_ky AND pfd.prod_family_dim_ky = iid.prod_family_dim_ky AND pid.pn_id::text = psf.pn_id::text;
 
--get the parametric data
SELECT cm.test_pen_id, cm.test_req_id ,  cm.date_test , cm.time_test , cm.partition_dm , to_timestamp(to_char(date_test, 'YYYY-MM-DD') || ' ' || time_test, 'YYYY-MM-DD HH24:MI:SS')::timestamp AS test_dm,
 CASE
                WHEN substr(replace(cm.test_title, '[[', '['), 33, 3) = '-L ' THEN 'L'
                WHEN substr(replace(cm.test_title, '[[', '['), 33, 3) = '-H ' THEN 'H'
                WHEN substr(replace(cm.test_title, '[[', '['), 33, 3) = '-U ' THEN 'U'
                WHEN substr(replace(cm.test_title, '[[', '['), 33, 3) = '-S ' THEN 'S'
                ELSE NULL
            END AS slot_type_cd,
            CASE
                WHEN cm.test_title LIKE '%L2R%' THEN 'L2R'
                WHEN cm.test_title LIKE '%R2L%' THEN 'R2L'
                ELSE 'L2R'
            END AS print_direction_cd,
            CASE
                WHEN cm.test_title LIKE '%9K%'  THEN 9
                WHEN cm.test_title LIKE '%18K%' THEN 18
                WHEN cm.test_title LIKE '%36K%' THEN 36
                ELSE 3.6
            END AS print_frequency_nr,
sadpad.sad_sd_even_deg , sadpad.sad_sd_odd_deg , sadpad.pad_sd_even_deg , sadpad.pad_sd_odd_deg  
FROM  falcon.cl_main cm
join falcon.cl_md_sadpad sadpad on sadpad.stamp = cm.stamp
where cm.test_req_id ='4HDMYEL260422D1';

--check if WO was tested, if not then some parametric is likely missing
select * from rptds.fceolqt_wo_result_fact where WORK_ORDER_ID 

--check ink type OF THE WORK_ORDER_ID is defined
select * from rptds.ink_type_dim where ink_type_cd in ('MGI','NSS');



--GET THE SETTING AND DATA SOURCES USED IN FALCAP
SELECT  CNSTR.FCEOLQT_WO_TEST_CNSTR_DIM_KY, TABLE_NM, COLUMN_NM, TEST_CRITERIA_NM
 from rptds.FCEOLQT_TEST_CRITERIA_DIM CRITERIA,
 (
    select FCEOLQT_TEST_CRITERIA_DIM_KY , FCEOLQT_WO_TEST_CNSTR_DIM_KY
    from RPTDS.FCEOLQT_WO_TEST_CNSTR_DIM
    where FCEOLQT_WO_TEST_CNSTR_DIM_KY IN (786 ,788)
 ) CNSTR
 where  CRITERIA.FCEOLQT_TEST_CRITERIA_DIM_KY =   CNSTR.FCEOLQT_TEST_CRITERIA_DIM_KY;

 /* Check if this work order was printed at FalCAP.-audited- For each p_wo_id*/
        SELECT
            COUNT(*) 
        FROM
            RPTDS.PEN_PROCESS_FACT PPF,
            RPTDS.PEN_INFO_DIM PID
        WHERE
            PID.LAST_WORK_ORDER_ID = '6HDMRKK260403D1' --p_wo_id
            AND PID.PN_ID = PPF.PN_ID
            AND PPF.PROCESS_STEP_DIM_KY = 2130;

  /* if printed at FALCap
   *  Get the ink type of this work order
   */        
            SELECT
                DISTINCT 
                PSF.INK_TYPE_DIM_KY 
            FROM
                RPTDS.PEN_INFO_DIM PID,
                RPTDS.PEN_SLOT_FACT PSF
            WHERE
                PID.LAST_WORK_ORDER_ID =  '6HDMRKK260403D1'  AND
                PSF.PN_ID = PID.PN_ID AND
                PSF.INK_TYPE_DIM_KY IS NOT NULL;
  
    /*  Get the arch id of this work order */       
           SELECT
                DISTINCT 
                DID.ARCH_ID 
            FROM
                RPTDS.PEN_INFO_DIM PID,
                RPTDS.PEN_SLOT_FACT PSF,
                RPTDS.DIE_INFO_DIM DID
            WHERE
                PID.LAST_WORK_ORDER_ID =  '4HDMRMAG250514D2'  AND
                PSF.PN_ID = PID.PN_ID AND
                DID.DIE_INFO_DIM_KY = PSF.DIE_INFO_DIM_KY; --38, 5029
                
   /* check any workorder test type that match with both ink type and arch id
    * arch_id: 20173,
ink_type_dim_ky: 52,
    */  
            SELECT
                FCEOLQT_WO_TYPE_DIM_KY /* v_test_type 201*/
            FROM
                RPTDS.FCEOLQT_WO_TYPE_DIM
            WHERE
                INK_TYPE_DIM_KY = 57 AND /*v_ink type*/
                ACTIVE_FG = 'Y' AND
                arch_id =  '10055'; --v_arch_id

   /* get the constraints keys with the test type p_cnstr_ky */
     SELECT *
             FROM RPTDS.FCEOLQT_WO_TEST_CNSTR_DIM
        WHERE  FCEOLQT_WO_TYPE_DIM_KY = 761 AND /*cp_wo_type_dim_ky*/
        ACTIVE_FG = 'Y';
       

   /* Get table name and column name of the value that is going to be tested. */
         SELECT 
            CNSTR.FCEOLQT_WO_TEST_CNSTR_DIM_KY, TABLE_NM, COLUMN_NM, TEST_CRITERIA_NM
           FROM
            FCEOLQT_TEST_CRITERIA_DIM CRITERIA,
            (
                SELECT
                    FCEOLQT_TEST_CRITERIA_DIM_KY , FCEOLQT_WO_TEST_CNSTR_DIM_KY
                FROM
                    RPTDS.FCEOLQT_WO_TEST_CNSTR_DIM
                WHERE
                    FCEOLQT_WO_TEST_CNSTR_DIM_KY IN (791,792,788,784,781,782,783,785,786,787)
            ) CNSTR
         WHERE
            CRITERIA.FCEOLQT_TEST_CRITERIA_DIM_KY = 
                CNSTR.FCEOLQT_TEST_CRITERIA_DIM_KY;


-- TABLE_NM, COLUMN_NM ARE THE DATA SOURCE REQUIRED IN FALCAP , TABLE_NM COULD BE rptds.pen_slot_fact AND rptds.pen_nozzle_column_fact
SELECT pn_id, die_site_nr ,slot_dim_ky , inv_item_dim_ky , ink_type_dim_ky, work_order_id,arch_id,odd_ink_type_nm,odd_ink_color_nm,even_ink_type_nm,even_ink_color_nm,slot_cd,ink_type_cd,prod_color_cd,
cap_clou_test_dm, cap_clou_sad_mean_sep_deg_vl , cap_clou_she_deg_av, cap_clou_drop_size_mic_av, cap_clou_drop_shape_av , cap_clou_drop_shape_sd ,
hue2_test_dm, hue2_astar_av, hue2_astar_sd, hue2_astar_mx, hue2_astar_mi, 
hue2_bstar_av, hue2_bstar_sd, hue2_bstar_mx, hue2_bstar_mi,
hue2_lstar_av v, hue2_lstar_sd d, hue2_lstar_mx, hue2_lstar_mi FROM RPTDS.pen_slot_fact WHERE WORK_ORDER_ID IN ('6HDMRKK260404D6');

select  pn_id, die_site_nr ,nozzle_column_dim_ky ,slot_dim_ky , inv_item_dim_ky , ink_type_dim_ky, prod_color_dim_ky,
cap_clou_test_dm ,cap_clou_test_dt_dim_ky,cap_clou_sad_deg_sd,cap_clou_she_deg_vl,cap_clou_drop_size_mic_av,cap_clou_drop_size_mic_sd,cap_clou_drop_shape_av,
cap_clou_drop_shape_sd, cap_clou_pad_deg_sd, cap_clou_l2r9_test_dm, cap_clou_l2r9_test_dt_dim_ky, cap_clou_l2r9_sad_deg_sd, cap_clou_l2r9_she_deg_vl, 
cap_clou_l2r9_drop_size_mic_av, cap_clou_l2r9_drop_size_mic_sd, cap_clou_l2r9_drop_shape_av, cap_clou_l2r9_drop_shape_sd, cap_clou_l2r9_pad_deg_sd ,
cap_clou_l2r18_test_dm,cap_clou_l2r18_test_dt_dim_ky, cap_clou_l2r18_sad_deg_sd,cap_clou_l2r18_she_deg_vl, cap_clou_l2r18drop_size_mic_av,
cap_clou_l2r18drop_size_mic_sd,cap_clou_l2r18_drop_shape_av,cap_clou_l2r18_drop_shape_sd,cap_clou_l2r18_pad_deg_sd
from RPTDS.pen_nozzle_column_fact  WHERE pn_id in (
select distinct pn_id from  RPTDS.pen_slot_fact WHERE WORK_ORDER_ID IN ('6HDMRKK260404D6'));

-- ANOTHER PARAMETRIC DATA IN FALCAP IS cap_clou_sad_deg_sd, cap_clou_pad_deg_sd
select work_order_id , psf.slot_cd , psf.prod_color_dim_ky, psf.slot_dim_ky , sd.slot_type_cd , psf.die_site_nr , psf.pn_id , psf.cap_clou_test_dm ,
 pncf.nozzle_column_dim_ky, ncd.nozzle_column_cd , 
 case when ncd.nozzle_column_cd like '%R%' then cap_clou_sad_deg_sd  end  sad_sd_odd_deg,
 case when ncd.nozzle_column_cd like '%R%' then cap_clou_pad_deg_sd  end  pad_sd_odd_deg,
 case when ncd.nozzle_column_cd like '%L%' then cap_clou_sad_deg_sd  end  sad_sd_even_deg,
 case when ncd.nozzle_column_cd like '%L%' then cap_clou_pad_deg_sd  end  pad_sd_even_deg
 from rptds.pen_slot_fact psf
 join rptds.pen_nozzle_column_fact pncf on psf.pn_id = pncf.pn_id
  join rptds.nozzle_column_dim ncd on ncd.nozzle_column_dim_ky =  pncf.nozzle_column_dim_ky
 join rptds.slot_dim sd on sd.slot_cd=psf.slot_cd and sd.slot_dim_ky=psf.slot_dim_ky
 where work_order_id ='4HDMYEL260422D1' and psf.slot_dim_ky in (12,11,14,13) and psf.cap_clou_test_dm ='2026-04-28 13:26:19.000';


--cap_clou* COLUMNS DATA WERE SOURCE FROM FALCON.CL_MAIN* TABLE INTO rptds.pen_slot_fact, WHERE TEST_PEN_ID IS EQUIVALENT TO PN_ID AND TEST_REQ_ID EQUIVALENT TO WORK_ORDER_ID
SELECT *  FROM FALCON.CL_MAIN WHERE TEST_REQ_ID IN
('6HDMRKK260404D1') ;

--HUE2* COLUMNS DATA WERE SOURCE FROM FALCON.sample_analysis* TABLE INTO rptds.pen_slot_fact, WHERE SAMPLE_ID IS EQUIVALENT TO PN_ID AND JOB_ID EQUIVALENT TO WORK_ORDER_ID
SELECT *  FROM FALCON.sample_analysis WHERE job_id IN
('6HDMRKK260404D1')    


#### 4. Analysis Logic
Provide methods to compute:
- missing data detection

#### 5. Output Format
Provide:
- Step-by-step of why the finding if work order id has no falcap result
