import os
import json
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import timedelta, date, datetime

FULL_PATH = r'/home/scadmin'
# paths
root_folder = Path(f'{FULL_PATH}/citf-public')
vax_national_csv = root_folder.joinpath('vaccination').joinpath('vax_malaysia.csv')
vax_state_csv = root_folder.joinpath('vaccination').joinpath('vax_state.csv')
reg_national_csv = root_folder.joinpath('registration').joinpath('vaxreg_malaysia.csv')
reg_state_csv = root_folder.joinpath('registration').joinpath('vaxreg_state.csv')
static_pop = root_folder.joinpath('static').joinpath('population.csv')

DATA_EXPORT_PATH = f'{FULL_PATH}/vaxapp/data/data2.json'

HERD_TARGET_PCT = 0.8
PHASE2_TARGET_PCT = 0.1
PHASE3_TARGET_PCT = 0.4
PHASE4_TARGET_PCT = 0.6
FULL_TARGET_PCT = 1.0
PERIOD_WINDOW = 14 # for daily doses data
ROLL_WINDOW = 7 # for vaccination rate
N_TOP_STATES = 5

# proportion of AZ in total vaccine supply
PROP_AZ = 0.0748
PROP_OTHERS = 0.925
# weighted average of dose interval based on 3 weeks pfizer/sinovac and 9 weeks AZ
AVG_DOSE_INT = int((21*PROP_OTHERS) + (63*PROP_AZ))

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

summarized_states = ['W.P. Kuala Lumpur','W.P. Putrajaya','Selangor']

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
    dfvs = pd.concat([dfvs, dfvn]) # concat national and state 
    dfvs['date_dt'] = pd.to_datetime(dfvs.date, format='%Y-%m-%d')
    dfvs.set_index(['date_dt','state'],inplace=True)

    # create KV summary
    dfvs_kv = dfvs.xs('Selangor',level=1) + dfvs.xs('W.P. Kuala Lumpur', level=1) + dfvs.xs('W.P. Putrajaya', level=1) 
    dfvs_kv['state'] = 'Klang Valley'
    dfvs_kv['date'] = dfvs.xs('Selangor',level=1)['date'] # fixed summed date
    dfvs_kv.set_index('state',append=True,inplace=True)
    dfvs = pd.concat([dfvs,dfvs_kv]).sort_index()

    # get latest day slice
    dfvs_dateindex = dfvs.index.get_level_values('date_dt')
    dfvs_dateindex = pd.DatetimeIndex(dfvs_dateindex)
    latest_date = dfvs_dateindex.max() # USE latest date in dataset!
    latest_dfv = dfvs.loc[latest_date]
    latest_lastday_dfv = dfvs.loc[latest_date - timedelta(days=1)] 

    # vax rate by state - only for vax dataset
    state_doses_data = {}
    state_target_hits = {} 
    if 'total_daily' in dfvs.columns.tolist():
        # extract milestones that were hit: when (date) and doses administered
        dfvs['dose2_pct_adult'] = dfvs.dose2_cumul/dfpop['pop_18']
        dfvs['dose2_pct_total'] = dfvs.dose2_cumul/dfpop['pop']

        state_target_hits = {} 
        for pop_level in ['adult','total']:
            state_target_hits[pop_level] = {}
            for state_name, state_period in dfvs.groupby('state'):
                state_target_hits[pop_level][state_name] = state_target_hits[pop_level][state_name] if state_name in state_target_hits[pop_level].keys() else {}

                for target in [PHASE2_TARGET_PCT, PHASE3_TARGET_PCT, PHASE4_TARGET_PCT, HERD_TARGET_PCT, FULL_TARGET_PCT]:
                    dose2_pct = state_period.dose2_pct_adult if pop_level == 'adult' else state_period.dose2_pct_total
                    p3_period = state_period[dose2_pct > target]
                    if not p3_period.empty:
                        p3_hit_date = p3_period[:1].iloc[0].name[0]
                        p3_hit_dose2 = p3_period[:1].iloc[0].dose2_cumul
                        state_target_hits[pop_level][state_name][target] = (p3_hit_date, p3_hit_dose2)
                        print(f'{state_name} hit {target} target at {p3_hit_date} achieving {p3_hit_dose2}')        

        # aggregate daily doses data by state
        dfvs_period_window = dfvs[latest_date - pd.offsets.Day(PERIOD_WINDOW - 1):]    
        for state_name, state_period in dfvs_period_window.groupby('state'):
            state_doses_data[state_name] = prepare_doses_data(state_period)

        # calculate last n day daily dose rate
        dfvs_lastweek = dfvs[latest_date - pd.offsets.Day(ROLL_WINDOW - 1):] 
        avg_dose1_rate = dfvs_lastweek.groupby('state')['dose1_daily'].mean()
        avg_dose2_rate = dfvs_lastweek.groupby('state')['dose2_daily'].mean()
        avg_total_rate = dfvs_lastweek.groupby('state')['total_daily'].mean()
        dfvs_lastweek_shifted = dfvs[latest_date - pd.offsets.Day(ROLL_WINDOW):latest_date - pd.offsets.Day(1)] # compare with shifted back (old) rate
        avg_dose1_rate_shifted = dfvs_lastweek_shifted.groupby('state')['dose1_daily'].mean()

        # from latest date in dataset, 24 days projected sum of dose 2 based on last 24 days dose 1
        dfvs_dose_interval = dfvs[latest_date - pd.offsets.Day(AVG_DOSE_INT - 1):]
        states_projected_dose2_total = dfvs_dose_interval.groupby('state')['dose1_daily'].sum()
        states_projected_dose2_total_list = dfvs_dose_interval.groupby('state')['dose1_daily'].apply(list)

        latest_dfv.loc[:,'avg_dose1_rate'] = avg_dose1_rate
        latest_dfv.loc[:,'avg_dose2_rate'] = avg_dose2_rate
        latest_dfv.loc[:,'avg_total_rate'] = avg_total_rate
        latest_dfv.loc[:,'projected_dose2_total'] = states_projected_dose2_total + latest_dfv['dose2_cumul']  
        latest_dfv.loc[:,'projected_dose2_total_list'] = states_projected_dose2_total_list

        latest_dfv.loc[:,'is_daily_rate_incr'] = latest_dfv.total_daily > latest_lastday_dfv.total_daily
        latest_dfv.loc[:,'is_avg_rate_incr'] = avg_dose1_rate > avg_dose1_rate_shifted

    latest_dfv['date_dt'] = pd.to_datetime(latest_dfv.date, format='%Y-%m-%d',errors='ignore')
    latest_dfv = latest_dfv.drop(summarized_states)
    return latest_dfv, state_doses_data, state_target_hits

def prepare_doses_data(dfvn):    
    daily_data = []
    for _, day_row in dfvn[-PERIOD_WINDOW:].iterrows():
        daily_dict = {
            'date': day_row['date'],
            'dose1': day_row['dose1_daily'],
            'dose1_display': f"{day_row['dose1_daily']:,}",
            'dose2': day_row['dose2_daily'],
            'dose2_display': f"{day_row['dose2_daily']:,}"
        }
        daily_data.append(daily_dict)
    return daily_data

def estimate_complete_by_target(target_pct, target_pop, current_vax_rate, current_vax_total, projected_within_int=0, start_date=date.today()):
    """
    Given target percent, target pop and current progress and rate, 
    calculate days remaining to hit target.
    """
    projected_dose2_sum = sum(projected_within_int) + current_vax_total
    remaining = 0
    if projected_dose2_sum < (target_pop*target_pct):
        # if confident projection within target population, include projection period
        # --|today|------|24th day|----|target|-----
        current_vax_total = projected_dose2_sum 
        remaining = (target_pop*target_pct) - current_vax_total    
        days_from_start_date = remaining/current_vax_rate
    else:
        # --|today|-----|target|---|24th day|-------
        start_date = date.today()
        target_pop = target_pop*target_pct
        days_from_start_date = 0
        for dose2_by_day in projected_within_int:
            current_vax_total += dose2_by_day
            remaining = target_pop - current_vax_total
            if current_vax_total >= target_pop:     
                remaining = current_vax_total - target_pop
                break       
            
            days_from_start_date += 1
    print(f'\tRemaining doses: {int(remaining)} for:')
    
    target_date = start_date + timedelta(days=days_from_start_date)
    days_remaining = (target_date - date.today()).days 

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
    total_reg = (dfr.total - dfr.children) if pop_level == 'adult' else dfr.total

    # get latest values
    dfv = dfvs.loc[state_name]
    progress_data = {}
    progress_data[pop_level], avg_dose1_rate, projected_dose2_total_list, latest_dose2_total = calculate_overall_progress(total_pop, total_reg, dfv)

    latest_dose1_total = dfv.dose1_cumul # received at least one dose (includes dose 2 peeps)
    latest_partial_vax = latest_dose1_total - latest_dose2_total # received only one dose (partially vaxxed)

    dose2_pct = latest_dose2_total/total_pop # fully vaxxed
    partial_pct = latest_partial_vax/total_pop # partially vaxxed

    total_reg_unvaxed = total_reg - latest_dose1_total  # registered but unvaccinated
    total_reg_unvaxed_pct = total_reg_unvaxed/total_pop
    total_reg_pct = min(total_reg/total_pop, 1) # cannot be more than 1
    total_unreg = max(total_pop - total_reg, 0)
    total_unreg_pct = max(total_unreg/total_pop, 0) # cannot be less than 0
    # total_unreg_pct = max(1 - total_reg_pct, 0) 
    
    projection_start_date = date.today() + timedelta(AVG_DOSE_INT-1)

    # estimate here again for top states (fix this duplicate)
    days_remaining, target_date = estimate_complete_by_target(HERD_TARGET_PCT, total_pop, avg_dose1_rate, latest_dose2_total, projected_dose2_total_list, projection_start_date)  
    
    # build timeline data
    milestones = {}
    milestones[pop_level], herd_date_total, herd_days_total = calculate_milestone_projections(total_pop, avg_dose1_rate, latest_dose2_total, projected_dose2_total_list, projection_start_date, state_target_hits[state_name])
    progress_data[pop_level]['herd_days'] =  int(herd_days_total)
    progress_data[pop_level]['herd_date_dp'] =  herd_date_total.strftime('%d %B %Y')
    
    # build state chart data
    state_chart_data = { 
        'full': progress_data[pop_level]['full'], 
        'full_display': progress_data[pop_level]['full_dp'], 
        'full_count': progress_data[pop_level]['full_count_dp'],
        'partial': progress_data[pop_level]['partial'], 
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
    
    return progress_data, days_remaining, target_date, milestones, state_chart_data

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
    latest_total = dfvn.total_cumul # total administered
    latest_dose1_total = dfvn.dose1_cumul # received at least one dose (includes dose 2 peeps)
    latest_dose2_total = dfvn.dose2_cumul # fully vaxxed
    latest_partial_vax = latest_dose1_total - latest_dose2_total # received only one dose (partially vaxxed)
    latest_daily_rate = dfvn.total_daily
    latest_daily_dose1 = dfvn.dose1_daily
    latest_daily_dose2 = dfvn.dose2_daily   
    latest_date = dfvn.index.max()
    
    # boolean to indicate increase or decrease in daily rate
    is_daily_rate_incr = dfvn.is_daily_rate_incr# if 'is_daily_rate_incr' in dfvn else latest_daily_dose2 > dfvn[-2:].iloc[0].dose2_daily 
    latest_rate_per_100 = latest_daily_rate/total_pop*100
    
    # next 24 days projected sum of dose 2 based on dose 1
    # if 'projected_dose2_total' not in dfvn:
    #     dfvn_dose_interval = dfvn[latest_date - pd.offsets.Day(AVG_DOSE_INT - 1):]
    #     projected_dose2_total = dfvn_dose_interval['dose1_daily'].sum() #+ latest_dose2_total
    # else:
    projected_dose2_total = dfvn.projected_dose2_total
    projected_dose2_total_list = dfvn.projected_dose2_total_list

    # rolling 7 day avg    
    # if 'avg_dose1_rate' not in dfvn:
    #     avg_total_rate = dfvn[-ROLL_WINDOW:].total_daily.mean()
    #     avg_dose1_rate = dfvn[-ROLL_WINDOW:].dose1_daily.mean()
    #     avg_dose2_rate = dfvn[-ROLL_WINDOW:].dose2_daily.mean()
    #     avg_rate_per_100 = avg_total_rate/total_pop*100
    # else:
    avg_dose1_rate = dfvn.avg_dose1_rate
    avg_dose2_rate = dfvn.avg_dose2_rate
    avg_total_rate = dfvn.avg_total_rate
    avg_rate_per_100 = dfvn.avg_total_rate/total_pop*100
        
    # if 'is_avg_rate_incr' not in dfvn:
    #     avg_dose2_rate_shifted = dfvn[-ROLL_WINDOW-1:-1].dose2_daily.mean() # previous average 7d rate
    #     is_avg_rate_incr = avg_dose2_rate > avg_dose2_rate_shifted # boolean to indicate increase or decrease in avg rate
    # else:
    is_avg_rate_incr = dfvn.is_avg_rate_incr    

    # calculating percentages - 2 sets of population
    dose2_pct = latest_dose2_total/total_pop # fully vaxxed
    partial_pct = latest_partial_vax/total_pop # partially vaxxed

    total_reg_unvaxed = max(total_reg - latest_dose1_total, 0)  # registered but unvaccinated
    total_reg_unvaxed_pct = max(total_reg_unvaxed/total_pop, 0)

    total_unreg = max(total_pop - total_reg, 0)
    total_unreg_pct = max(total_unreg/total_pop, 0)

    # adjust for more than 100% - else graphs will break
    sum_pct = sum([dose2_pct, partial_pct, total_reg_unvaxed_pct, total_unreg_pct])
    if sum_pct > 1.0:
        print(f'sum_pct: {sum_pct}')
        # adjust unreg_pct if not zero
        if total_unreg_pct > 0:
            print('\t Adjusting total_unreg_pct')
            total_unreg_pct = total_unreg_pct - (sum_pct - 1.0)
        elif total_reg_unvaxed_pct > 0:
            print('\t Adjusting total_reg_unvaxed_pct')
            total_reg_unvaxed_pct = total_reg_unvaxed_pct - (sum_pct - 1.0)
        print(f'\tNew sum_pct {sum([dose2_pct, partial_pct, total_reg_unvaxed_pct, total_unreg_pct])}')
    
    # build json
    progress_data = {
        'today_date_dp': dfvn.date_dt.strftime('%d %b'),
        'total_pop_dp': f'{total_pop:,}',

        'full': dose2_pct,
        'full_dp': f'{dose2_pct*100:.2f}%',
        'full_dp_tw': f'w-[{dose2_pct*100:.2f}%]',
        'full_count_dp': f'{latest_dose2_total:,}',

        'partial': partial_pct,
        'partial_dp': f'{partial_pct*100:.2f}%',
        'partial_dp_tw': f'w-[{partial_pct*100:.2f}%]',
        'partial_count_dp': f'{latest_partial_vax:,}',

        'total_count_dp': f'{latest_total:,}',
        'total_dose1_dp': f'{latest_dose1_total:,}',

        'reg': total_reg_unvaxed_pct,
        'reg_dp': f'{total_reg_unvaxed_pct*100:.2f}%',
        'reg_dp_tw': f'w-[{total_reg_unvaxed_pct*100:.2f}%]',
        'reg_count_dp': f'{total_reg_unvaxed:,}',
        'total_reg_count_dp': f'{total_reg:,}',

        'unreg': total_unreg_pct,
        'unreg_dp': f'{total_unreg_pct*100:.2f}%',
        'unreg_dp_tw': f'w-[{total_unreg_pct*100:.2f}%]',
        'unreg_count_dp': f'{total_unreg:,}',

        'rate_latest': f'{latest_daily_rate:,}',
        'rate_latest_d1': f'{latest_daily_dose1:,}',
        'rate_latest_d2': f'{latest_daily_dose2:,}',
        'rate_latest_100': f'{latest_rate_per_100:.2f}',
        'is_rate_latest_incr': bool(is_daily_rate_incr),

        'rate_avg': f'{int(avg_total_rate):,}',
        'rate_avg_d1': f'{int(avg_dose1_rate):,}',
        'rate_avg_d2': f'{int(avg_dose2_rate):,}',
        'rate_avg_100': f'{avg_rate_per_100:.2f}',
        'is_rate_avg_incr': bool(is_avg_rate_incr),
    }
    return progress_data, avg_dose1_rate, projected_dose2_total_list, latest_dose2_total

def calculate_milestone_projections(total_pop, avg_dose1_rate, latest_dose2_total, projected_within_int=0, start_date=date.today(), target_hits={}):
    """
    Run estimations for each milestone to build timeline data
    Returns estimation projection results for herd target for progress_data
    """
    milestones = {} # (days remaining, target date)
    for target in [PHASE2_TARGET_PCT, PHASE3_TARGET_PCT, PHASE4_TARGET_PCT, HERD_TARGET_PCT, FULL_TARGET_PCT]:
        if target in target_hits.keys(): # (date hit, dose 2)
            milestones[target] = ( (target_hits[target][0] - pd.Timestamp(date.today())).days  , target_hits[target][0].date())
        else:
            # return - (days remaining, target date)
            milestones[target] = estimate_complete_by_target(target, total_pop, avg_dose1_rate, latest_dose2_total, projected_within_int, start_date)
        print(f'{milestones[target][0]:.2f} days until {target} fully vaxxed on {milestones[target][1]}')

    # build dict
    milestones_adult = [
        {
            'name': 'begin',
            'name_display': 'Start',
            'milestone_label': '',
            'date': date(2021,2,24),
            'x_pct': '20%', # fixed
            'x_pct_val': 0.1,
            'n_days': abs(date.today() - date(2021,2,24)).days
        },
        {
            'name': '10pct',
            'name_display': '10%',
            'milestone_label': 'NRP Phase 1 → 2',
            'date': milestones[PHASE2_TARGET_PCT][1],
            'x_pct_val': 0.1,
            'n_days': int(milestones[PHASE2_TARGET_PCT][0]),
            #'n_count': "3,190,789",  source: https://www.theedgemarkets.com/article/ten-cent-population-fully-vaccinated-%E2%80%94-khairy
        },
        {
            'name': '40pct',
            'name_display': '40%',
            'milestone_label': 'NRP Phase 2 → 3',
            'date': milestones[PHASE3_TARGET_PCT][1],
            'x_pct_val': 0.4,
            'n_days': int(milestones[PHASE3_TARGET_PCT][0]),
        },
        {
            'name': '60pct',
            'name_display': '60%',
            'milestone_label': 'NRP Phase 3 → 4',
            'date': milestones[PHASE4_TARGET_PCT][1],
            'x_pct_val': 0.6,
            'n_days': int(milestones[PHASE4_TARGET_PCT][0]),
        },
        {
            'name': '80pct',
            'name_display': '80%',
            'milestone_label': 'Herd Immunity Target',
            'date': milestones[HERD_TARGET_PCT][1],
            'x_pct_val': 0.8,
            'n_days': int(milestones[HERD_TARGET_PCT][0]),
        }
    ]
    
    # calculate timeline data for drawing
    # length of full timeline in days
    max_date = milestones[FULL_TARGET_PCT][1]
    max_date_length = max_date - date.today()
    min_date_length = date.today() - milestones[PHASE2_TARGET_PCT][1]
    timeline_len = max_date_length*2 if max_date_length > min_date_length else min_date_length*2

    for ind, milestone in enumerate(milestones_adult):    
        milestones_adult[ind]['date_display'] = milestone['date'].strftime('%d %b')    
        if milestone['name'] == 'begin': 
            pct = 0.2
        else:
            if date.today() >= milestone['date']:
                # milestone passed
                dist_from_mid = 0.5 - (date.today()-milestone['date'])/timeline_len
                pct = ((dist_from_mid/0.5) * (0.5 - 0.25)) + 0.25  # scale to 0.25 -> 0.5         
            else:
                # future milestone
                pct = 1 - (max_date - milestone['date'])/timeline_len

            milestones_adult[ind]['x_pct'] = f'{pct*100:.2f}%'
            milestones_adult[ind]['x_pct_val'] = pct
            
        milestones_adult[ind]['has_past'] = date.today() >= milestone['date']
        if 'n_count' not in milestones_adult[ind].keys():
            milestones_adult[ind]['n_count'] = f"{int(milestone['x_pct_val']*total_pop):,}"

        milestones_adult[ind]['n_days'] = abs(milestones_adult[ind]['n_days'])
        del milestones_adult[ind]['date']
        
    return milestones_adult, milestones[HERD_TARGET_PCT][1], milestones[HERD_TARGET_PCT][0]

if __name__ == "__main__":

    # prepare population data
    dfpop = pd.read_csv(static_pop)
    # create klang valley population
    kv_pop = dfpop[(dfpop.state=='Selangor') | (dfpop.state=='W.P. Kuala Lumpur') | (dfpop.state=='W.P. Putrajaya')].sum()
    kv_pop.state = 'Klang Valley'
    kv_pop.name = 17
    dfpop = dfpop.append(kv_pop)
    dfpop.set_index('state', inplace=True)

    # preprocess vax and reg CSVs
    latest_dfv, state_doses_data, state_target_hits = preprocess_csv(vax_national_csv, vax_state_csv, dfpop)
    latest_dfr, _, _ = preprocess_csv(reg_national_csv, reg_state_csv, dfpop)

    # START BUILDING JSON DATA
    data_levels = ['total','adult']
    state_charts_data = {}
    top_states_data = {}
    by_state_data = {}
    for pop_level in data_levels:
        # PROCESS ALL STATES
        states_list = []    
        state_charts_data[pop_level] = []
        for state_name, _ in latest_dfv.iterrows():
            print(f'Processing state: {bcolors.WARNING}{state_name} ({pop_level}){bcolors.ENDC}')
            by_state_data[state_name] = by_state_data.get(state_name, {})
            progress_data, days_remaining, target_date, milestones_data, state_chart_data = summary_by_state(state_name, dfpop, latest_dfv, latest_dfr, pop_level, state_target_hits[pop_level])

            if state_name != "Malaysia":
                state_charts_data[pop_level].append(state_chart_data)
            by_state_data[state_name]['progress'] = by_state_data[state_name].get('progress', {})
            by_state_data[state_name]['progress'].update(progress_data)
            
            by_state_data[state_name]['doses'] = by_state_data[state_name].get('doses', {})
            by_state_data[state_name]['doses'] = state_doses_data[state_name]
            
            by_state_data[state_name]['timeline'] = by_state_data[state_name].get('timeline', {})
            by_state_data[state_name]['timeline'].update(milestones_data)  
            
            if int(days_remaining) > 0:
                states_list.append({'name': state_name, 'herd_n_days': int(days_remaining), 'herd_date_dp': target_date.strftime('%d %b')}) # for top states

        # sort state_charts_data
        state_charts_data[pop_level] = sorted(state_charts_data[pop_level], key = lambda state_chart: state_chart['full'], reverse=True)    
        # sort top states data
        top_states_data[pop_level] = sorted(states_list, key=lambda state: state['herd_n_days'])[:5]

    all_data = {
        'by_state': by_state_data, # combined progress, timeline, doses
        'top_states': top_states_data,
        'state': state_charts_data
    }

    with open(DATA_EXPORT_PATH, 'w') as fp:
        json.dump(all_data, fp)