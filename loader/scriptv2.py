import os
import json
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import timedelta, date, datetime

FULL_PATH = r'/opt'
# paths
root_folder = Path(f'{FULL_PATH}/citf-public')
vax_national_csv = root_folder.joinpath(
    'vaccination').joinpath('vax_malaysia.csv')
vax_state_csv = root_folder.joinpath('vaccination').joinpath('vax_state.csv')
reg_national_csv = root_folder.joinpath(
    'registration').joinpath('vaxreg_malaysia.csv')
reg_state_csv = root_folder.joinpath(
    'registration').joinpath('vaxreg_state.csv')
static_pop = root_folder.joinpath('static').joinpath('population.csv')

DATA_EXPORT_PATH = f'{FULL_PATH}/vaxapp-prod/data/data3.json'

HERD_TARGET_PCT = 0.8
PHASE2_TARGET_PCT = 0.2
PHASE3_TARGET_PCT = 0.4
PHASE4_TARGET_PCT = 0.6
FULL_TARGET_PCT = 1.0
PERIOD_WINDOW = 14  # for daily doses data
ROLL_WINDOW = 7  # for vaccination rate
N_TOP_STATES = 5

# proportion of AZ in total vaccine supply (updated 3/8)
PROP_AZ = 0.0857
PROP_OTHERS = 0.9143
# weighted average of dose interval based on 3 weeks pfizer/sinovac and 9 weeks AZ
AVG_DOSE_INT = round((21*PROP_OTHERS) + (63*PROP_AZ))
PFSN_DOSE_INT = 21
AZ_DOSE_INT = 63

state_abbr = {'Johor': 'JHR',
              'Kedah': 'KDH',
              'Kelantan': 'KTN',
              'Melaka': 'MLK',
              'Negeri Sembilan': 'NSN',
              'Pahang': 'PHG',
              'Perak': 'PRK',
              'Perlis': 'PLS',
              'Pulau Pinang': 'PNG',
              'Sabah': 'SBH',
              'Sarawak': 'SWK',
              'Terengganu': 'TRG',
              'W.P. Labuan': 'LBN',
              'Klang Valley': 'KV',
              'Malaysia': 'MY'}

summarized_states = ['W.P. Kuala Lumpur', 'W.P. Putrajaya', 'Selangor']

# 17/8

# for console printing


class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def preprocess_csv(national_csv, state_csv, dfpop):
    """
    Main pre-process funciton to combine national and state CSVs
    National level data is treated as a State
    Returns aggregated summary by state for latest date in data set
    For vaccination CSV, also returns doses data by state and target hits
    """

    # read national csv
    dfvn = pd.read_csv(national_csv)
    dfvn['state'] = 'Malaysia'

    # read state csv
    dfvs = pd.read_csv(state_csv)
    dfvs = pd.concat([dfvs, dfvn])  # concat national and state
    dfvs['date_dt'] = pd.to_datetime(dfvs.date, format='%Y-%m-%d')
    dfvs.set_index(['date_dt', 'state'], inplace=True)

    # create KV summary
    dfvs_kv = dfvs.xs('Selangor', level=1) + dfvs.xs('W.P. Kuala Lumpur',
                                                     level=1) + dfvs.xs('W.P. Putrajaya', level=1)
    dfvs_kv['state'] = 'Klang Valley'
    dfvs_kv['date'] = dfvs.xs('Selangor', level=1)['date']  # fixed summed date
    dfvs_kv.set_index('state', append=True, inplace=True)
    dfvs = pd.concat([dfvs, dfvs_kv]).sort_index()

    # get latest day slice
    dfvs_dateindex = dfvs.index.get_level_values('date_dt')
    dfvs_dateindex = pd.DatetimeIndex(dfvs_dateindex)
    latest_date = dfvs_dateindex.max()  # USE latest date in dataset!
    latest_dfv = dfvs.loc[latest_date]
    latest_lastday_dfv = dfvs.loc[latest_date - timedelta(days=1)]

    # vax rate by state - only for vax dataset
    state_doses_data_byvax = {}
    state_target_hits = {}
    if 'pfizer1' in dfvs.columns.tolist():
        # cumulative by vax type
        pfizer1_cumul = dfvs.groupby('state')['pfizer1'].sum()
        pfizer2_cumul = dfvs.groupby('state')['pfizer2'].sum()
        sinovac1_cumul = dfvs.groupby('state')['sinovac1'].sum()
        sinovac2_cumul = dfvs.groupby('state')['sinovac2'].sum()
        astra1_cumul = dfvs.groupby('state')['astra1'].sum()
        astra2_cumul = dfvs.groupby('state')['astra2'].sum()
        cansino2_cumul = dfvs.groupby('state')['cansino'].sum()

        # extract milestones that were hit: when (date) and doses administered
        dfvs['dose2_pct_adult'] = dfvs.cumul_full/dfpop['pop_18']
        dfvs['dose2_pct_total'] = dfvs.cumul_full/dfpop['pop']

        dfvs['pfsn1'] = dfvs['pfizer1'] + dfvs['sinovac1']

        state_target_hits = {}
        for pop_level in ['adult', 'total']:
            state_target_hits[pop_level] = {}
            for state_name, state_period in dfvs.groupby('state'):
                state_target_hits[pop_level][state_name] = state_target_hits[pop_level][state_name] if state_name in state_target_hits[pop_level].keys() else {
                }

                for target in [PHASE2_TARGET_PCT, PHASE3_TARGET_PCT, PHASE4_TARGET_PCT, HERD_TARGET_PCT, FULL_TARGET_PCT]:
                    dose2_pct = state_period.dose2_pct_adult if pop_level == 'adult' else state_period.dose2_pct_total
                    p3_period = state_period[dose2_pct > target]
                    if not p3_period.empty:
                        p3_hit_date = datetime.combine(
                            p3_period[:1].iloc[0].name[0], datetime.min.time())
                        p3_hit_dose2 = p3_period[:1].iloc[0].cumul_full
                        state_target_hits[pop_level][state_name][target] = (
                            p3_hit_date, p3_hit_dose2)
                        print(
                            f'{state_name} hit {target} target at {p3_hit_date} achieving {p3_hit_dose2}')        

        # calculate last n day daily dose rate
        dfvs_lastweek = dfvs[latest_date -
                             pd.offsets.Day(ROLL_WINDOW - 1):latest_date]
        avg_dose1_rate = dfvs_lastweek.groupby('state')['daily_partial'].mean()
        avg_dose2_rate = dfvs_lastweek.groupby('state')['daily_full'].mean()
        avg_total_rate = dfvs_lastweek.groupby('state')['daily'].mean()

        avg_pf_rate = dfvs_lastweek.groupby('state')['pfizer1'].mean()
        avg_sn_rate = dfvs_lastweek.groupby('state')['sinovac1'].mean()
        avg_pfsn_rate = dfvs_lastweek.groupby('state')['pfsn1'].mean()
        avg_az_rate = dfvs_lastweek.groupby('state')['astra1'].mean()

        # compare with shifted back (old) rate
        dfvs_lastweek_shifted = dfvs[latest_date -
                                     pd.offsets.Day(ROLL_WINDOW):latest_date - pd.offsets.Day(1)]
        avg_dose1_rate_shifted = dfvs_lastweek_shifted.groupby('state')[
            'daily_partial'].mean()

        # from latest date in dataset, 24 days projected sum of dose 2 based on last 24 days dose 1
        dfvs_dose_interval = dfvs[latest_date -
                                  pd.offsets.Day(AVG_DOSE_INT - 1):]
        states_projected_dose2_total = dfvs_dose_interval.groupby('state')[
            'daily_partial'].sum()
        states_projected_dose2_total_list = dfvs_dose_interval.groupby('state')[
            'daily_partial'].apply(list)

        states_pf_dose2_list = dfvs[latest_date - pd.offsets.Day(
            PFSN_DOSE_INT - 1):latest_date].groupby('state')['pfizer1'].apply(list).fillna(0)
        states_sn_dose2_list = dfvs[latest_date - pd.offsets.Day(
            PFSN_DOSE_INT - 1):latest_date].groupby('state')['sinovac1'].apply(list).fillna(0)
        states_pfsn_dose2_list = dfvs[latest_date - pd.offsets.Day(
            PFSN_DOSE_INT - 1):latest_date].groupby('state')['pfsn1'].apply(list).fillna(0)
        states_az_dose2_list = dfvs[latest_date - pd.offsets.Day(
            AZ_DOSE_INT - 1):latest_date].groupby('state')['astra1'].apply(list).fillna(0)

        latest_dfv.loc[:, 'avg_dose1_rate'] = avg_dose1_rate
        latest_dfv.loc[:, 'avg_dose2_rate'] = avg_dose2_rate
        latest_dfv.loc[:, 'avg_total_rate'] = avg_total_rate
        latest_dfv.loc[:, 'avg_pfsn_rate'] = avg_pfsn_rate
        latest_dfv.loc[:, 'avg_az_rate'] = avg_az_rate
        latest_dfv.loc[:, 'projected_dose2_total'] = states_projected_dose2_total + \
            latest_dfv['cumul_full']
        latest_dfv.loc[:, 'projected_dose2_total_list'] = states_projected_dose2_total_list
        latest_dfv.loc[:, 'states_pfsn_dose2_list'] = states_pfsn_dose2_list
        latest_dfv.loc[:, 'states_az_dose2_list'] = states_az_dose2_list

        latest_dfv.loc[:, 'is_daily_rate_incr'] = latest_dfv.daily > latest_lastday_dfv.daily
        latest_dfv.loc[:,
                       'is_avg_rate_incr'] = avg_dose1_rate > avg_dose1_rate_shifted

        latest_dfv.loc[:, 'pfizer1_cumul'] = pfizer1_cumul
        latest_dfv.loc[:, 'pfizer2_cumul'] = pfizer2_cumul
        latest_dfv.loc[:, 'sinovac1_cumul'] = sinovac1_cumul
        latest_dfv.loc[:, 'sinovac2_cumul'] = sinovac2_cumul
        latest_dfv.loc[:, 'astra1_cumul'] = astra1_cumul
        latest_dfv.loc[:, 'astra2_cumul'] = astra2_cumul
        latest_dfv.loc[:, 'astra2_cumul'] = astra2_cumul
        latest_dfv.loc[:, 'cansino2_cumul'] = cansino2_cumul

        # aggregate daily doses data by state
        dfvs_period_window = dfvs[latest_date -
                                  pd.offsets.Day(PERIOD_WINDOW - 1):]
        for state_name, state_period in dfvs_period_window.groupby('state'):
            state_doses_data_byvax[state_name] = prepare_doses_byvax_data(
                state_period, avg_pf_rate[state_name], avg_sn_rate[state_name], avg_az_rate[state_name], states_pf_dose2_list[state_name], states_sn_dose2_list[state_name], states_az_dose2_list[state_name])

    latest_dfv['date_dt'] = pd.to_datetime(
        latest_dfv.date, format='%Y-%m-%d', errors='ignore')
    latest_dfv = latest_dfv.drop(summarized_states)
    return latest_dfv, state_doses_data_byvax, state_target_hits



def prepare_doses_byvax_data(dfvn, avg_pf_rate, avg_sn_rate, avg_az_rate, pf_dose2_list, sn_dose2_list, az_dose2_list):
    daily_data = []
    last_date = None
    for _, day_row in dfvn[-PERIOD_WINDOW:].iterrows():
        daily_dict = {
            'date': day_row['date'],
            'dose1_pfizer': day_row['pfizer1'],
            'dose1_sino': day_row['sinovac1'],
            'dose1_astra': day_row['astra1'],
            'dose1_display': f"{day_row['daily_partial']:,}",
            'dose2_pfizer': day_row['pfizer2'],
            'dose2_sino': day_row['sinovac2'],
            'dose2_astra': day_row['astra2'],
            'dose2_cansino': day_row['cansino'],
            'dose2_display': f"{day_row['daily_full']:,}",
            'full_display': f"{day_row['daily']:,}",
        }
        daily_data.append(daily_dict)
        last_date = day_row.name[0]

    for ind in range(7):
        avg_rate_total = int(round(avg_pf_rate + avg_sn_rate + avg_az_rate,0))
        dose2_total = pf_dose2_list[ind] + sn_dose2_list[ind] + az_dose2_list[ind]
        full_total = avg_rate_total + dose2_total
        daily_dict = {
            'date': (last_date + timedelta(days=ind+1)).strftime("%Y-%m-%d"),
            'dose1_pfizer': round(avg_pf_rate,0),
            'dose1_sino': round(avg_sn_rate,0),
            'dose1_astra': round(avg_az_rate,0),
            'dose1_display': f"{avg_rate_total:,}",
            'dose2_pfizer': pf_dose2_list[ind],
            'dose2_sino': sn_dose2_list[ind],
            'dose2_astra': az_dose2_list[ind],
            'dose2_cansino': 0, #TODO: include average rate of cansino doses
            'dose2_display': f"{dose2_total:,}",
            'full_display': f"{full_total:,}",
            'projection': True
        }
        daily_data.append(daily_dict)
    return daily_data


def estimate_complete_by_target(target_pct, target_pop, pfsn_vax_rate, az_vax_rate, current_vax_total, pfsn_dose2_list=[], az_dose2_list=[], start_date=date.today()):
    """
    Given target percent, target pop and current progress and rate, 
    calculate days remaining to hit target.
    """
    target_pop = target_pop*target_pct

    az_dose2_list_21 = az_dose2_list[:PFSN_DOSE_INT]
    az_dose2_list_beyond_21 = az_dose2_list[PFSN_DOSE_INT:]

    remaining = 0
    days_remaining = 0
    days_remaining_21d_after = 0
    # project 21 days and beyond
    projected_sum_21d = current_vax_total + \
        sum(pfsn_dose2_list) + sum(az_dose2_list_21)
    days_remaining_21d = 0
    if projected_sum_21d < target_pop:
        days_remaining_21d = PFSN_DOSE_INT
        current_vax_total = projected_sum_21d
        remaining = target_pop - current_vax_total
    else:
        #
        for i in range(PFSN_DOSE_INT):
            current_vax_total = current_vax_total + \
                pfsn_dose2_list[i] + az_dose2_list[i]

            if current_vax_total > target_pop:
                break
            else:
                remaining = target_pop - current_vax_total
            days_remaining_21d += 1
            print(
                f'Day {days_remaining_21d}: Fully vaxed: {current_vax_total}, remaining {remaining}')
    print(
        f'End of {days_remaining_21d} days: Fully vaxed: {current_vax_total}, remaining {remaining}')

    # project next 42 days (21 days to 63 days)
    if remaining > 0:
        # target 42 days and beyond
        projected_sum_63d = current_vax_total + \
            sum(az_dose2_list_beyond_21) + \
            (pfsn_vax_rate*(AZ_DOSE_INT-PFSN_DOSE_INT))
        days_remaining_21d_after = 0
        if projected_sum_63d < target_pop:
            days_remaining_21d_after = AZ_DOSE_INT-PFSN_DOSE_INT
            current_vax_total = projected_sum_63d
            remaining = target_pop - current_vax_total

            # if still remaining beyond 63 days
            if remaining > 0:
                days_remaining = remaining/(pfsn_vax_rate + az_vax_rate)
                remaining = 0
                print(f'End of {days_remaining+days_remaining_21d+days_remaining_21d_after} days (++ {days_remaining} days): Fully vaxed: {current_vax_total}, remaining {remaining}')

        else:
            # target within next 42 days
            for i in range(AZ_DOSE_INT-PFSN_DOSE_INT):
                current_vax_total = current_vax_total + pfsn_vax_rate + \
                    az_dose2_list_beyond_21[i]
                if current_vax_total > target_pop:
                    break
                else:
                    remaining = target_pop - current_vax_total

                days_remaining_21d_after += 1
                print(
                    f'Day {days_remaining_21d+days_remaining_21d_after}: Fully vaxed: {round(current_vax_total,2)}, pfsn: {round(pfsn_vax_rate,2)}, az2: {round(az_dose2_list_beyond_21[i],2)}, remaining {round(remaining,2)}')
            print(f'End of {days_remaining_21d+days_remaining_21d_after} days (+ {days_remaining_21d_after} days): Fully vaxed: {current_vax_total}, remaining {remaining}')

    days_remaining = days_remaining+days_remaining_21d+days_remaining_21d_after
    target_date = start_date + timedelta(days=days_remaining + 1)

    if target_date <= date.today():
        print(f'\t{bcolors.OKBLUE}Check{bcolors.ENDC}: Target date has passed')

    return days_remaining, target_date


def summary_by_state(state_name, dfpop, dfvs, dfrs, pop_level='adult', state_target_hits={}):
    """Calculate progress summary and projections by state"""
    if pop_level == 'adult':
        total_pop = dfpop.loc[state_name]['pop_18']
    else:
        total_pop = dfpop.loc[state_name]['pop']

    dfr = dfrs.loc[state_name]
    total_reg = (
        dfr.total - dfr.children) if pop_level == 'adult' else dfr.total

    # get latest values
    dfv = dfvs.loc[state_name]
    progress_data = {}
    progress_data[pop_level], pfsn_vax_rate, az_vax_rate, pfsn_dose2_list, az_dose2_list, latest_dose2_total = calculate_overall_progress(
        total_pop, total_reg, dfv)

    # projection_start_date = date.today() + timedelta(AVG_DOSE_INT-1)
    projection_start_date = dfv.date_dt

    # build timeline data
    milestones = {}
    milestones[pop_level], herd_date_total, herd_days_total = calculate_milestone_projections(
        pop_level, total_pop, pfsn_vax_rate, az_vax_rate, latest_dose2_total, pfsn_dose2_list, az_dose2_list, projection_start_date, state_target_hits[state_name])

    
    # visualize next 7 days
    first_dose_7d = [round(pfsn_vax_rate + az_vax_rate,0)] * 7
    second_dose_7d = list(np.add(pfsn_dose2_list[:7], az_dose2_list[:7]))

    # don't abs this, if passed leave it as negative so frontend can handle
    progress_data[pop_level]['herd_days'] = int(herd_days_total)
    progress_data[pop_level]['herd_date_dp'] = herd_date_total.strftime(
        '%d %B %Y')

    # build state chart data
    state_chart_data = {
        'full': progress_data[pop_level]['full'],
        'full_display': progress_data[pop_level]['full_dp'],
        'full_count': progress_data[pop_level]['full_count_dp'],
        'partial': progress_data[pop_level]['partial'],
        'partial_adj': progress_data[pop_level]['partial_adj'],
        'partial_display': progress_data[pop_level]['partial_dp'],
        'partial_count': progress_data[pop_level]['partial_count_dp'],
        'reg': progress_data[pop_level]['reg'],
        'reg_display': progress_data[pop_level]['reg_dp'],
        'reg_count': progress_data[pop_level]['reg_count_dp'],
        'unreg': progress_data[pop_level]['unreg'],
        'unreg_display': progress_data[pop_level]['unreg_dp'],
        'unreg_count': progress_data[pop_level]['unreg_count_dp'],
        'name': state_name,
        'name_abbr': state_abbr[state_name],
        'herd_n_days': progress_data[pop_level]['herd_days'],
        'herd_date_dp': progress_data[pop_level]['herd_date_dp']
    }

    # exceed bar charts - fix by chipping the extra off the FULL bar
    sum_pct = sum([state_chart_data['full'], state_chart_data['partial_adj'],
                  state_chart_data['reg'], state_chart_data['unreg']])
    if sum_pct > 1.0:
        print(
            f'State chart: {state_name} sum_pct {sum_pct} exceed: {sum_pct-1}')
        state_chart_data['full'] = state_chart_data['full'] - (sum_pct-1)

    return progress_data, milestones, state_chart_data, herd_date_total, first_dose_7d, second_dose_7d


def calculate_overall_progress(total_pop, total_reg, dfvn):
    """
    State level progress milestones and rates based on latest data.
    Takes in filtered `total_pop` and `total_reg` based on total or adult level.
    Returns: 
        progress data dictionary
        projected_dose2_date: 
            Average dose 1 rate: projection based on dose 1 + dose interval = future dose 2 rate
        projected_dose2_total:
            Project total of dose 2 in next dose interval days based on dose 1 + latest actual dose 2
    """
    # get latest values
    latest_total = dfvn.cumul  # total administered
    latest_cansino_cumul = dfvn.cansino2_cumul
    # cumul_partial is now unique individuals vaxxed (incl at least dose 1, cansino)
    latest_dose1_total = dfvn.cumul_partial  # received 1 dose 
    latest_dose2_total = dfvn.cumul_full  # fully vaxxed including cansino
    # received only one dose (partially vaxxed) - waiting for 2nd dose 
    # cansino gets cancelled out here
    latest_partial_vax = latest_dose1_total - latest_dose2_total 
    latest_daily_rate = dfvn.daily
    latest_daily_dose1 = dfvn.daily_partial
    latest_daily_dose2 = dfvn.daily_full
    latest_date = dfvn.index.max()

    # boolean to indicate increase or decrease in daily rate
    is_daily_rate_incr = dfvn.is_daily_rate_incr
    latest_rate_per_100 = latest_daily_rate/total_pop*100

    projected_dose2_total_list = dfvn.projected_dose2_total_list

    avg_dose1_rate = dfvn.avg_dose1_rate
    avg_dose2_rate = dfvn.avg_dose2_rate
    avg_total_rate = dfvn.avg_total_rate
    avg_rate_per_100 = dfvn.avg_total_rate/total_pop*100

    is_avg_rate_incr = dfvn.is_avg_rate_incr

    # calculating percentages - vax type breakdown pct wrt to dose group
    dose2_pct = latest_dose2_total/total_pop  # fully vaxxed
    dose2_pf_pct = dfvn.pfizer2_cumul/latest_dose2_total  # fully vaxxed
    dose2_sn_pct = dfvn.sinovac2_cumul/latest_dose2_total  # fully vaxxed
    dose2_az_pct = dfvn.astra2_cumul/latest_dose2_total  # fully vaxxed
    dose2_cn_pct = dfvn.cansino2_cumul/latest_dose2_total  # fully vaxxed
    partial_pct = latest_partial_vax/total_pop  # partially vaxxed
    partial_pf_pct = (dfvn.pfizer1_cumul - dfvn.pfizer2_cumul) / \
        latest_partial_vax  # partially vaxxed
    partial_sn_pct = (dfvn.sinovac1_cumul - dfvn.sinovac2_cumul) / \
        latest_partial_vax  # partially vaxxed
    partial_az_pct = (dfvn.astra1_cumul - dfvn.astra2_cumul) / \
        latest_partial_vax  # partially vaxxed

    # percentages wrt full progress bar
    dose2_sn_bar_pct = dfvn.sinovac2_cumul/total_pop
    dose2_pf_bar_pct = dfvn.pfizer2_cumul/total_pop
    dose2_az_bar_pct = dfvn.astra2_cumul/total_pop
    dose2_cn_bar_pct = dfvn.cansino2_cumul/total_pop
    partial_pf_bar_pct = (dfvn.pfizer1_cumul - dfvn.pfizer2_cumul) / \
        total_pop
    partial_sn_bar_pct = (dfvn.sinovac1_cumul - dfvn.sinovac2_cumul) / \
        total_pop
    partial_az_bar_pct = (dfvn.astra1_cumul - dfvn.astra2_cumul) / \
        total_pop

    # registered but unvaccinated
    # this should contrasted from latest cumul_partial
    total_reg_unvaxed = max(total_reg - latest_dose1_total, 0)
    total_reg_unvaxed_pct = max(total_reg_unvaxed/total_pop, 0)

    total_unreg = max(total_pop - total_reg, 0)
    total_unreg_pct = max(total_unreg/total_pop, 0)

    # adjust for more than 100% - else graphs will break
    partial_pct_disp = None
    sum_pct = sum(
        [dose2_pct, partial_pct, total_reg_unvaxed_pct, total_unreg_pct])
    if sum_pct > 1.0:
        print(f'sum_pct: {sum_pct}')
        # adjust unreg_pct if not zero
        if total_unreg_pct > 0:
            print('\t Adjusting total_unreg_pct')
            total_unreg_pct = max(total_unreg_pct - (sum_pct - 1.0), 0)
        elif total_reg_unvaxed_pct > 0:
            print('\t Adjusting total_reg_unvaxed_pct')
            total_reg_unvaxed_pct = total_reg_unvaxed_pct - (sum_pct - 1.0)
            if total_reg_unvaxed_pct < 0:
                diff = abs(total_reg_unvaxed_pct)
                total_reg_unvaxed_pct = 0
                # partial_pct_disp = partial_pct 
                # partial_pf_pct_disp = partial_pf_pct*partial_pct_disp
                # partial_sn_pct_disp = partial_sn_pct*partial_pct_disp
                # partial_az_pct_disp = partial_az_pct*partial_pct_disp
        print(
            f'\tNew sum_pct {sum([dose2_pct, partial_pct, total_reg_unvaxed_pct, total_unreg_pct])}')

    # build json
    progress_data = {
        'today_date_dp': dfvn.date_dt.strftime('%d %b'),
        'total_pop_dp': f'{total_pop:,}',

        'full': dose2_pct,
        'full_dp': f'{dose2_pct*100:.1f}%',
        'full_count_dp': f'{latest_dose2_total:,}',

        'full_pf': round(dose2_pf_pct, 3),
        'full_pf_bar': round(dose2_pf_bar_pct, 3),
        'full_pf_bar_dp': f'{dose2_pf_bar_pct*100:.1f}%',
        'full_pf_dp': f'{dose2_pf_pct*100:.1f}%',
        'full_pf_count_dp': f'{dfvn.pfizer2_cumul:,}',

        'full_sn': round(dose2_sn_pct, 3),
        'full_sn_bar': round(dose2_sn_bar_pct, 3),
        'full_sn_bar_dp': f'{dose2_sn_bar_pct*100:.1f}%',
        'full_sn_dp': f'{dose2_sn_pct*100:.1f}%',
        'full_sn_count_dp': f'{dfvn.sinovac2_cumul:,}',

        'full_az': round(dose2_az_pct, 3),
        'full_az_bar': round(dose2_az_bar_pct, 3),
        'full_az_bar_dp': f'{dose2_az_bar_pct*100:.1f}%',
        'full_az_dp': f'{dose2_az_pct*100:.1f}%',
        'full_az_count_dp': f'{dfvn.astra2_cumul:,}',

        'full_cn': round(dose2_cn_pct, 3),
        'full_cn_bar': round(dose2_cn_bar_pct, 3),
        'full_cn_bar_dp': f'{dose2_cn_bar_pct*100:.1f}%',
        'full_cn_dp': f'{dose2_cn_pct*100:.1f}%',
        'full_cn_count_dp': f'{dfvn.cansino2_cumul:,}',

        # if partial_pct_disp is None else partial_pct_disp,
        'partial': round(partial_pct, 3),
        'partial_adj': round(partial_pct, 3) if partial_pct_disp is None else partial_pct_disp,
        'partial_dp': f'{partial_pct*100:.1f}%' if partial_pct_disp is None else f'{partial_pct_disp*100:.1f}%',
        'partial_count_dp': f'{latest_partial_vax:,}',

        'partial_pf': round(partial_pf_pct, 3),
        'partial_pf_bar': round(partial_pf_bar_pct, 3),
        'partial_pf_bar_dp': f'{partial_pf_bar_pct*100:.1f}%' if partial_pct_disp is None else f'{partial_pf_pct_disp*100:.1f}%',
        'partial_pf_dp': f'{partial_pf_pct*100:.1f}%',
        'partial_pf_count_dp': f'{(dfvn.pfizer1_cumul - dfvn.pfizer2_cumul):,}',

        'partial_sn': round(partial_sn_pct, 3),
        'partial_sn_bar': round(partial_sn_bar_pct, 3),
        'partial_sn_bar_dp': f'{partial_sn_bar_pct*100:.1f}%' if partial_pct_disp is None else f'{partial_sn_pct_disp*100:.1f}%',
        'partial_sn_dp': f'{partial_sn_pct*100:.1f}%',
        'partial_sn_count_dp': f'{(dfvn.sinovac1_cumul - dfvn.sinovac2_cumul):,}',

        'partial_az': round(partial_az_pct, 3),
        'partial_az_bar': round(partial_az_bar_pct, 3),
        'partial_az_bar_dp': f'{partial_az_bar_pct*100:.1f}%' if partial_pct_disp is None else f'{partial_az_pct_disp*100:.1f}%',
        'partial_az_dp': f'{partial_az_pct*100:.1f}%',
        'partial_az_count_dp': f'{(dfvn.astra1_cumul - dfvn.astra2_cumul):,}',

        'total_count_dp': f'{latest_total:,}',
        'total_dose1_dp': f'{latest_dose1_total:,}',

        'reg': round(total_reg_unvaxed_pct, 3),
        'reg_dp': f'{total_reg_unvaxed_pct*100:.1f}%',
        'reg_count_dp': f'{total_reg_unvaxed:,}',
        'total_reg_count_dp': f'{total_reg:,}',

        'unreg': round(total_unreg_pct, 3),
        'unreg_dp': f'{total_unreg_pct*100:.1f}%',
        'unreg_dp_tw': f'w-[{total_unreg_pct*100:.1f}%]',
        'unreg_count_dp': f'{total_unreg:,}',

        'rate_latest': f'{latest_daily_rate:,}',
        'rate_latest_d1': f'{latest_daily_dose1:,}',
        'rate_latest_d2': f'{latest_daily_dose2:,}',
        'rate_latest_100': f'{latest_rate_per_100:.1f}',
        'is_rate_latest_incr': bool(is_daily_rate_incr),

        'rate_avg': f'{int(avg_total_rate):,}',
        'rate_avg_d1': f'{int(avg_dose1_rate):,}',
        'rate_avg_d2': f'{int(avg_dose2_rate):,}',
        'rate_avg_100': f'{avg_rate_per_100:.1f}',
        'is_rate_avg_incr': bool(is_avg_rate_incr),
    }
    return progress_data, dfvn.avg_pfsn_rate, dfvn.avg_az_rate,  dfvn.states_pfsn_dose2_list, dfvn.states_az_dose2_list, latest_dose2_total


def calculate_milestone_projections(pop_level, total_pop, pfsn_vax_rate, az_vax_rate, latest_dose2_total, pfsn_dose2_list=[], az_dose2_list=[], start_date=datetime.today(), target_hits={}):
    """
    Run estimations for each milestone to build timeline data
    Returns estimation projection results for herd target for progress_data
    """
    milestones = {}  # (days remaining, target date, dose2)
    for target in [PHASE2_TARGET_PCT, PHASE3_TARGET_PCT, PHASE4_TARGET_PCT, HERD_TARGET_PCT, FULL_TARGET_PCT]:
        if target in target_hits.keys():  # (date hit, dose 2)
            milestones[target] = ((target_hits[target][0] - pd.Timestamp(datetime.today())).days + 1, # 'subtract' one day here as past date + extra hours counted as one day
                                  target_hits[target][0], int(target_hits[target][1]))
        else:
            # return - (days remaining, target date)
            days_remaining, target_date = estimate_complete_by_target(
                target, total_pop, pfsn_vax_rate, az_vax_rate, latest_dose2_total, pfsn_dose2_list, az_dose2_list, start_date)
            milestones[target] = (days_remaining, target_date, None)
        print(
            f'{milestones[target][0]} days to target {target} ({milestones[target][1]}). ')

    # build dict
    milestones_list = [
        {
            'name': 'begin',
            'name_display': 'Start',
            'date': datetime(2021, 2, 24),
            'x_pct': '20%',  # fixed
            'x_pct_ori': 0.0,
            'n_days': abs(datetime.today() - datetime(2021, 2, 24)).days,
            'n_count': 0,
        },
        {
            'name': '20pct',
            'name_display': '20%',
            'date': milestones[PHASE2_TARGET_PCT][1],
            'x_pct_ori': 0.2,
            'n_days': int(milestones[PHASE2_TARGET_PCT][0]),
            'n_count': milestones[PHASE2_TARGET_PCT][2]
            # 'n_count': "3,190,789",  source: https://www.theedgemarkets.com/article/ten-cent-population-fully-vaccinated-%E2%80%94-khairy
        },
        {
            'name': '40pct',
            'name_display': '40%',
            'date': milestones[PHASE3_TARGET_PCT][1],
            'x_pct_ori': 0.4,
            'n_days': int(milestones[PHASE3_TARGET_PCT][0]),
            'n_count': milestones[PHASE3_TARGET_PCT][2]
        },
        {
            'name': '60pct',
            'name_display': '60%',
            'date': milestones[PHASE4_TARGET_PCT][1],
            'x_pct_ori': 0.6,
            'n_days': int(milestones[PHASE4_TARGET_PCT][0]),
            'n_count': milestones[PHASE4_TARGET_PCT][2]
        },
        {
            'name': '80pct',
            'name_display': '80%',
            'date': milestones[HERD_TARGET_PCT][1],
            'x_pct_ori': 0.8,
            'n_days': int(milestones[HERD_TARGET_PCT][0]),
            'n_count': milestones[HERD_TARGET_PCT][2]
        }
    ]
    if pop_level == 'adult':
        milestones_list.append({
            'name': '100pct',
            'name_display': '100%',
            'date': milestones[FULL_TARGET_PCT][1],
            'x_pct_ori': 1.0,
            'n_days': int(milestones[FULL_TARGET_PCT][0]),
            'n_count': milestones[FULL_TARGET_PCT][2]
        })

    # calculate timeline data for drawing
    # length of full timeline in days VERSION 2
    max_date = milestones[FULL_TARGET_PCT][1]
    min_date = milestones[PHASE2_TARGET_PCT][1]
    full_date_range = milestones[FULL_TARGET_PCT][1] - min_date
    past_range = datetime.today() - min_date  # left of timeline

    def scale_to_range(num, target_min, target_max, ori_min, ori_max):
        return (target_max - target_min) * (num - ori_min) / (ori_max - ori_min) + target_min

    # post processing milestones
    for ind, milestone in enumerate(milestones_list):
        milestones_list[ind]['date_display'] = milestone['date'].strftime(
            '%d %b')

        if milestone['name'] == 'begin':
            pct = 0.2
        else:
            days_since_min_date = (milestone['date'] - min_date).days
            if datetime.today() < milestone['date']:
                # future - RHS of timeline scale to 50%-80%
                pct = scale_to_range(days_since_min_date, 0.5,
                                     0.8, past_range.days, full_date_range.days)
            else:
                # past - LHS of timeline scale to 30%-49%
                pct = scale_to_range(days_since_min_date, 0.3,
                                     0.5, 0, past_range.days)

        milestones_list[ind]['x_pct'] = f'{pct*100:.1f}%'
        milestones_list[ind]['x_pct_val'] = round(pct, 1)

        milestones_list[ind]['has_past'] = datetime.today(
        ) >= milestone['date']

        if milestones_list[ind]['n_count'] is None:
            # unreached milestones - calculate target population
            milestones_list[ind]['n_count'] = int(
                milestone['x_pct_ori']*total_pop)
        milestones_list[ind]['n_count'] = f"{milestones_list[ind]['n_count']:,}"

        milestones_list[ind]['n_days'] = abs(milestones_list[ind]['n_days'])
        del milestones_list[ind]['date']

    if milestones_list[4]['has_past']:
        # if 80pct target reached, remove 40% 60%
        del milestones_list[2:4]

    return milestones_list, milestones[HERD_TARGET_PCT][1], milestones[HERD_TARGET_PCT][0]


if __name__ == "__main__":

    # prepare population data
    dfpop = pd.read_csv(static_pop)
    # create klang valley population
    kv_pop = dfpop[(dfpop.state == 'Selangor') | (
        dfpop.state == 'W.P. Kuala Lumpur') | (dfpop.state == 'W.P. Putrajaya')].sum()
    kv_pop.state = 'Klang Valley'
    kv_pop.name = 17
    dfpop = dfpop.append(kv_pop)
    dfpop.set_index('state', inplace=True)

    # preprocess vax and reg CSVs
    latest_dfv, state_doses_data_byvax, state_target_hits = preprocess_csv(
        vax_national_csv, vax_state_csv, dfpop)
    latest_dfr, _, _ = preprocess_csv(
        reg_national_csv, reg_state_csv, dfpop)

    # START BUILDING JSON DATA
    data_levels = ['total', 'adult']
    state_charts_data = {}
    top_states_data = {}
    by_state_data = {}
    for pop_level in data_levels:
        # PROCESS ALL STATES
        states_list = []
        state_charts_data[pop_level] = []
        for state_name, _ in latest_dfv.iterrows():
            print(
                f'Processing state: {bcolors.WARNING}{state_name} ({pop_level}){bcolors.ENDC}')
            by_state_data[state_name] = by_state_data.get(state_name, {})
            progress_data, milestones_data, state_chart_data, herd_date, first_dose_7d, second_dose_7d = summary_by_state(
                state_name, dfpop, latest_dfv, latest_dfr, pop_level, state_target_hits[pop_level])

            if state_name != "Malaysia":
                state_charts_data[pop_level].append(state_chart_data)
            by_state_data[state_name]['progress'] = by_state_data[state_name].get(
                'progress', {})
            by_state_data[state_name]['progress'].update(progress_data)

            by_state_data[state_name]['doses_byvax'] = by_state_data[state_name].get('doses_byvax', {
            })
            by_state_data[state_name]['doses_byvax'] = state_doses_data_byvax[state_name]

            by_state_data[state_name]['timeline'] = by_state_data[state_name].get(
                'timeline', {})
            by_state_data[state_name]['timeline'].update(milestones_data)

            if int(progress_data[pop_level]['herd_days']) >= 0 and state_name != 'Malaysia':
                states_list.append({'name': state_name, 'herd_n_days': progress_data[pop_level]['herd_days'], 'herd_date_dp': herd_date.strftime(
                    '%d %b')})  # for top states

        # sort state_charts_data
        state_charts_data[pop_level] = sorted(
            state_charts_data[pop_level], key=lambda state_chart: state_chart['full'], reverse=True)
        # sort top states data
        top_states_data[pop_level] = sorted(
            states_list, key=lambda state: state['herd_n_days'])[:5]

    all_data = {
        'by_state': by_state_data,  # combined progress, timeline, doses
        'top_states': top_states_data,
        'state': state_charts_data
    }

    with open(DATA_EXPORT_PATH, 'w') as fp:
        json.dump(all_data, fp)
