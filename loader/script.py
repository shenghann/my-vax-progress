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

DATA_EXPORT_PATH = f'{FULL_PATH}/vaxapp/data/data.json'

HERD_TARGET_PCT = 0.8
PHASE3_TARGET_PCT = 0.4
PHASE4_TARGET_PCT = 0.6
FULL_TARGET_PCT = 1
PERIOD_WINDOW = 14 # for daily doses data
ROLL_WINDOW = 7 # for vaccination rate
ROLL_WINDOW_STATE = 14
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
 'Klang Valley': 'KV'}

def calculate_overall_progress(total_pop, total_reg, dfvn):
    """
    National progress milestones and rates based on latest data.
    Takes in filtered `total_pop` and `total_reg` based on total or adult level.
    Returns: 
        progress data dictionary
        projected_dose2_date: 
            Average dose 1 rate: projection based on dose 1 + dose interval = future dose 2 rate
        projected_dose2_total:
            Project total of dose 2 in next dose interval days based on dose 1 + latest actual dose 2
    """
    # get latest values
    latest_total = dfvn[-1:].iloc[0].total_cumul # total administered
    latest_dose1_total = dfvn[-1:].iloc[0].dose1_cumul # received at least one dose (includes dose 2 peeps)
    latest_dose2_total = dfvn[-1:].iloc[0].dose2_cumul # fully vaxxed
    latest_partial_vax = latest_dose1_total - latest_dose2_total # received only one dose (partially vaxxed)
    latest_daily_rate = dfvn[-1:].iloc[0].total_daily
    latest_daily_dose1 = dfvn[-1:].iloc[0].dose1_daily
    latest_daily_dose2 = dfvn[-1:].iloc[0].dose2_daily
    is_daily_rate_incr = latest_daily_dose2 > dfvn[-2:].iloc[0].dose2_daily # boolean to indicate increase or decrease in daily rate
    latest_rate_per_100 = latest_daily_rate/total_pop*100
    
    # next 24 days projected sum of dose 2 based on dose 1
    dfvn_dose_interval = dfvn[datetime.now() - pd.offsets.Day(AVG_DOSE_INT + 1):]
    projected_dose2_total = dfvn_dose_interval['dose1_daily'].sum() #+ latest_dose2_total
    
    # dfvn_dose1_shifted = dfvn['dose1_daily'].shift(AVG_DOSE_INT, freq="D")
    # projected_dose2_total = dfvn_dose1_shifted[date.today():].sum() + latest_dose2_total

    # rolling 7 day avg    
    avg_total_rate = dfvn[-ROLL_WINDOW:].total_daily.mean()
    avg_dose1_rate = dfvn[-ROLL_WINDOW:].dose1_daily.mean()
    avg_dose2_rate = dfvn[-ROLL_WINDOW:].dose2_daily.mean()
    avg_dose2_rate_shifted = dfvn[-ROLL_WINDOW-1:-1].dose2_daily.mean() # previous average 7d rate
    is_avg_rate_incr = avg_dose2_rate > avg_dose2_rate_shifted # boolean to indicate increase or decrease in avg rate
    avg_rate_per_100 = avg_total_rate/total_pop*100

    # calculating percentages - 2 sets of population
    dose2_pct = latest_dose2_total/total_pop # fully vaxxed
    partial_pct = latest_partial_vax/total_pop # partially vaxxed

    total_reg_unvaxed = total_reg - latest_dose1_total  # registered but unvaccinated
    total_reg_unvaxed_pct = total_reg_unvaxed/total_pop

    total_unreg = total_pop - total_reg
    total_unreg_pct = total_unreg/total_pop
    
    # build json
    progress_data = {
        'today_date_dp': dfvn[-1:].index[0].strftime('%d %b'),
        'total_pop_dp': f'{total_pop:,}',

        'full': dose2_pct,
        'full_dp': f'{dose2_pct*100:.2f}%',
        'full_dp_tw': f'w-[{dose2_pct*100:.2f}%]',
        'full_count_dp': f'{latest_dose2_total:,}',

        'partial': partial_pct,
        'partial_dp': f'{partial_pct*100:.2f}%',
        'partial_dp_tw': f'w-[{partial_pct*100:.2f}%]',
        'partial_count_dp': f'{latest_partial_vax:,}',

        'total_count_dp': f'{latest_dose1_total:,}',

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
    return progress_data, avg_dose1_rate, projected_dose2_total, latest_dose2_total

def estimate_complete_by_target(target_pct, target_pop, current_vax_rate, current_vax_total, projected_within_int=0, start_date=date.today()):
    """
    Given target percent, target pop and current progress and rate, 
    calculate days remaining to hit target.
    """
    if (current_vax_total+projected_within_int) < (target_pop*target_pct):
        # if projections within target population, include projection period
        current_vax_total = current_vax_total+projected_within_int
    else:
        start_date = date.today()
    remaining = (target_pop*target_pct) - current_vax_total    
    days_from_start_date = remaining/current_vax_rate
    target_date = start_date + timedelta(days=days_from_start_date)
    days_remaining = (target_date - date.today()).days 

    if target_date <= date.today():
        print('WARNING: target date has passed!')
    
    return days_remaining, target_date

def summary_by_state(state_name, dfpop, dfvs, dfrs, pop_level='adult'):
    """Calculate progress summary and projections by state"""
    if pop_level == 'adult':
        total_pop = dfpop[dfpop.state == state_name].iloc[0]['pop_18']
    else:
        total_pop = dfpop[dfpop.state == state_name].iloc[0]['pop']
    
    dfr = dfrs.loc[state_name]
    total_reg = (dfr.total - dfr.children) if pop_level == 'adult' else dfr.total

    # get latest values
    dfv = dfvs.loc[state_name]
    latest_dose1_total = dfv.dose1_cumul # received at least one dose (includes dose 2 peeps)
    latest_dose2_total = dfv.dose2_cumul # fully vaxxed
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
    days_remaining, target_date = estimate_complete_by_target(HERD_TARGET_PCT, total_pop, dfv.avg_dose1_rate, latest_dose2_total, dfv.projected_dose2_total, projection_start_date)
    
    # adjust for more than 100% - else graphs will break
    sum_pct = sum([dose2_pct, partial_pct, total_reg_unvaxed_pct, total_unreg_pct])
    if sum_pct > 1.0:
        print(f'{state_name} sum_pct: {sum_pct}')
        # adjust unreg_pct if not zero
        if total_unreg_pct > 0:
            print('\t Adjusting total_unreg_pct')
            total_unreg_pct = total_unreg_pct - (sum_pct - 1.0)
        elif total_reg_unvaxed_pct > 0:
            print('\t Adjusting total_reg_unvaxed_pct')
            total_reg_unvaxed_pct = total_reg_unvaxed_pct - (sum_pct - 1.0)
        print(f'\tNew {state_name} sum_pct {sum([dose2_pct, partial_pct, total_reg_unvaxed_pct, total_unreg_pct])}')
    
    return dose2_pct, latest_dose2_total, partial_pct, latest_partial_vax, total_reg_unvaxed_pct, total_reg_unvaxed, total_unreg_pct, total_unreg, days_remaining, target_date

def get_latest_day_state_record(csv_file_path):
    """Process state file and create summary for KV"""    
    dfvs = pd.read_csv(csv_file_path) 
    dfvs['date_dt'] = pd.to_datetime(dfvs.date, format='%Y-%m-%d')
    dfvs.set_index(['date_dt','state'],inplace=True)

    # get latest day slice
    dfvs_dateindex = dfvs.index.get_level_values('date_dt')
    dfvs_dateindex = pd.DatetimeIndex(dfvs_dateindex)
    latest_dfv = dfvs.loc[dfvs_dateindex.max()]

    # create KV summary
    latest_dfv_kv = latest_dfv.xs('Selangor') + latest_dfv.xs('W.P. Kuala Lumpur') + latest_dfv.xs('W.P. Putrajaya') 
    latest_dfv_kv.name = 'Klang Valley'
    latest_dfv = latest_dfv.append(latest_dfv_kv)
    
    # vax rate by state - only for vax dataset
    if 'total_daily' in dfvs.columns.tolist():
        # calculate last n day daily dose rate
        dfvs_lastweek = dfvs[datetime.now() - pd.offsets.Day(ROLL_WINDOW):]
        states_dose1 = dfvs_lastweek.groupby('state')['dose1_daily'].mean()    

        # next 24 days projected sum of dose 2 based on last 24 days dose 1
        dfvs_dose_interval = dfvs[datetime.now() - pd.offsets.Day(AVG_DOSE_INT + 1):]
        states_projected_dose2_total = dfvs_dose_interval.groupby('state')['dose1_daily'].sum()
        
        # repeat for Klang valley
        dfvs_lastweek_kv = dfvs_lastweek.xs('Selangor', level=1) + dfvs_lastweek.xs('W.P. Kuala Lumpur', level=1) + dfvs_lastweek.xs('W.P. Putrajaya', level=1) 
        states_dose1['Klang Valley'] = dfvs_lastweek_kv['dose1_daily'].mean()
        print(f'Avg KV doses: {dfvs_lastweek_kv["dose1_daily"].mean()}')

        dfvs_dose_interval_kv = dfvs_dose_interval.xs('Selangor', level=1) + dfvs_dose_interval.xs('W.P. Kuala Lumpur', level=1) + dfvs_dose_interval.xs('W.P. Putrajaya', level=1) 
        states_projected_dose2_total['Klang Valley'] = dfvs_dose_interval_kv['dose1_daily'].sum()  

        latest_dfv['avg_dose1_rate'] = states_dose1
        latest_dfv['projected_dose2_total'] = states_projected_dose2_total #+ latest_dfv['dose2_cumul']  

    latest_dfv.drop(['W.P. Kuala Lumpur','W.P. Putrajaya','Selangor'], inplace=True)
        
    return latest_dfv

def calculate_milestone_projections(total_pop, avg_dose1_rate, latest_dose2_total, projected_within_int=0, start_date=date.today()):
    """
    Run estimations for each milestone to build timeline data
    Returns estimation projection results for herd target for progress_data
    """
    # remaining days until 40% fully vaxxed (phase 2-> 3)
    days_phase3_dose2_adult, phase3_target_date_adult = estimate_complete_by_target(PHASE3_TARGET_PCT, total_pop, avg_dose1_rate, latest_dose2_total, projected_within_int, start_date)
    print(f'{days_phase3_dose2_adult:.2f} days until 40% adults fully vaxxed on {phase3_target_date_adult}')
    
    # remaining days until 60% fully vaxxed (exit phase 3)
    days_phase4_dose2_adult, phase4_target_date_adult = estimate_complete_by_target(PHASE4_TARGET_PCT, total_pop, avg_dose1_rate, latest_dose2_total, projected_within_int, start_date)
    #print(f'{days_phase4_dose2_adult:.2f} days until 60% adults fully vaxxed on {phase4_target_date_adult}')
    
    # remaining days until 80% fully vaxxed
    days_herd_adult_dose2, herd_target_date_adult = estimate_complete_by_target(HERD_TARGET_PCT, total_pop, avg_dose1_rate, latest_dose2_total, projected_within_int, start_date)
    print(f'{days_herd_adult_dose2:.2f} days until 80% adults fully vaxxed on {herd_target_date_adult}')
    
    # remaining days until 100% fully vaxxed
    days_full_adult_dose2, full_target_date_adult = estimate_complete_by_target(FULL_TARGET_PCT, total_pop, avg_dose1_rate, latest_dose2_total, projected_within_int, start_date)
    #print(f'{days_full_adult_dose2:.2f} days until 100% adults fully vaxxed on {full_target_date_adult}')
    
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
            'date': date(2021,7,9),
            'x_pct_val': 0.1,
            'n_days': abs(date.today() - date(2021,7,9)).days,
            'n_count': "3,190,789", # source: https://www.theedgemarkets.com/article/ten-cent-population-fully-vaccinated-%E2%80%94-khairy
        },
        {
            'name': '40pct',
            'name_display': '40%',
            'milestone_label': 'NRP Phase 2 → 3',
            'date': phase3_target_date_adult,
            'x_pct_val': 0.4,
            'n_days': int(days_phase3_dose2_adult),
        },
        {
            'name': '60pct',
            'name_display': '60%',
            'milestone_label': 'NRP Phase 3 → 4',
            'date': phase4_target_date_adult,
            'x_pct_val': 0.6,
            'n_days': int(days_phase4_dose2_adult),
        },
        {
            'name': '80pct',
            'name_display': '80%',
            'milestone_label': 'Herd Immunity Target',
            'date': herd_target_date_adult,
            'x_pct_val': 0.8,
            'n_days': int(days_herd_adult_dose2),
        }
    ]
    
    # calculate timeline data for drawing
    # length of full timeline in days
    timeline_len = (full_target_date_adult - date.today())*2
    end_date = full_target_date_adult

    for ind, milestone in enumerate(milestones_adult):    
        milestones_adult[ind]['date_display'] = milestone['date'].strftime('%d %b') if milestone['n_days'] > 0 else ''     
        if milestone['name'] == 'begin': 
            pct = 0.2
        else:
            if milestone['n_days'] > 0:
                pct = 1 - (full_target_date_adult - milestone['date'])/timeline_len
            else:
                pct = 0.5 # TODO: fix this
            milestones_adult[ind]['x_pct'] = f'{pct*100:.2f}%'
            milestones_adult[ind]['x_pct_val'] = pct
        milestones_adult[ind]['has_past'] = date.today() >= milestone['date']
        if 'n_count' not in milestones_adult[ind].keys():
            milestones_adult[ind]['n_count'] = f"{int(milestone['x_pct_val']*total_pop):,}"

        del milestones_adult[ind]['date']
        
    return milestones_adult, days_herd_adult_dose2, herd_target_date_adult

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

if __name__ == "__main__":
    
    # prepare population data
    dfpop = pd.read_csv(static_pop)
    # create klang valley population
    kv_pop = dfpop[(dfpop.state=='Selangor') | (dfpop.state=='W.P. Kuala Lumpur') | (dfpop.state=='W.P. Putrajaya')].sum()
    kv_pop.state = 'Klang Valley'
    kv_pop.name = 17
    dfpop = dfpop.append(kv_pop)

    total_pop = dfpop[dfpop.state == 'Malaysia'].iloc[0]['pop']
    total_pop_adult = dfpop[dfpop.state == 'Malaysia'].iloc[0]['pop_18']
    
    # read and prep registration and vaccination data
    dfrn = pd.read_csv(reg_national_csv) 
    total_reg = dfrn[-1:].iloc[0].total
    total_reg_adult = total_reg - dfrn[-1:].iloc[0].children # 18yo and above

    dfvn = pd.read_csv(vax_national_csv) 
    dfvn['date_dt'] = pd.to_datetime(dfvn.date, format='%Y-%m-%d')
    dfvn.set_index('date_dt', inplace=True)
    
    print(f'Running latest CITF data {dfvn[-1:].iloc[0].date}')
    
    # build national progress data
    progress_data = {}
    progress_data['total'], avg_dose1_rate, projected_dose2_total, latest_dose2_total = calculate_overall_progress(total_pop, total_reg, dfvn)
    progress_data['adult'], avg_dose1_rate, projected_dose2_total, latest_dose2_total = calculate_overall_progress(total_pop_adult, total_reg_adult, dfvn)
    
    print(f'\tProjected + actual dose 2 sum: {projected_dose2_total}, Avg Dose 1 rate {avg_dose1_rate}')
    
    # build doses data
    daily_data = prepare_doses_data(dfvn)
    
    # build state level progress data
    latest_dfv = get_latest_day_state_record(vax_state_csv)
    latest_dfr = get_latest_day_state_record(reg_state_csv)   
    
    data_levels = ['total','adult']
    state_charts_data = {}
    top_states_data = {}
    for pop_level in data_levels:
        states = []
        top_states_list = []
        latest_dfv_extra = latest_dfv.apply(lambda row: summary_by_state(row.name, dfpop, latest_dfv, latest_dfr, pop_level), axis=1, result_type='expand')
        latest_dfv_extra.columns = [
            'dose2_pct',
            'dose2_count',
            'partial_pct', 
            'partial_count', 
            'total_reg_unvaxed_pct', 
            'total_reg_unvaxed_count', 
            'total_unreg_pct', 
            'total_unreg_count', 
            'days_remaining', 
            'target_date'
        ]
        
        latest_dfv_combined = pd.concat([latest_dfv, latest_dfv_extra], axis=1)
        latest_dfv_combined.sort_values(by='dose2_pct', ascending=False, inplace=True)

        # build state charts data
        for _, row_state in latest_dfv_combined.iterrows():   
            state_data = { 
                'full': row_state['dose2_pct'], 
                'full_display': f"{row_state['dose2_pct']*100:.2f}%", 
                'full_count': f"{row_state['dose2_count']:,}",
                'partial': row_state['partial_pct'], 
                'partial_display': f"{row_state['partial_pct']*100:.2f}%",
                'partial_count': f"{row_state['partial_count']:,}",
                'reg': row_state['total_reg_unvaxed_pct'], 
                'reg_display': f"{row_state['total_reg_unvaxed_pct']*100:.2f}%",
                'reg_count': f"{row_state['total_reg_unvaxed_count']:,}",
                'unreg': row_state['total_unreg_pct'], 
                'unreg_display': f"{row_state['total_unreg_pct']*100:.2f}%",
                'unreg_count': f"{row_state['total_unreg_count']:,}",
                'name': row_state.name, 
                'name_abbr': state_abbr[row_state.name],
                'herd_n_days': round(row_state['days_remaining']), 
                'herd_date_dp': row_state['target_date'].strftime('%d %b %Y') if row_state['days_remaining'] > 0 else '' 
            }
            states.append(state_data)

        # build top 5 states
        for _, row_state in latest_dfv_combined.sort_values(by='days_remaining')[:N_TOP_STATES].iterrows():
            top_state_data = { 'name': row_state.name, 'herd_n_days': round(row_state['days_remaining']),
                             'herd_date_dp': row_state['target_date'].strftime('%d %b') if row_state['days_remaining'] > 0 else ''  }
            top_states_list.append(top_state_data)

        state_charts_data[pop_level] = states
        top_states_data[pop_level] = top_states_list
        
    # build timeline data
    projection_start_date = date.today() + timedelta(AVG_DOSE_INT-1)
    milestones = {}
    milestones['total'], herd_days_total, herd_date_total = calculate_milestone_projections(total_pop, avg_dose1_rate, latest_dose2_total, projected_dose2_total, projection_start_date)
    milestones['adult'], herd_days_adult, herd_date_adult = calculate_milestone_projections(total_pop_adult, avg_dose1_rate, latest_dose2_total, projected_dose2_total, projection_start_date)
    
    # update progress data with time projections
    progress_data['total']['herd_days'] = int(herd_days_total)
    progress_data['total']['herd_date_dp'] = herd_date_total.strftime('%d %B %Y')
    progress_data['adult']['herd_days'] = int(herd_days_adult)
    progress_data['adult']['herd_date_dp'] = herd_date_adult.strftime('%d %B %Y')
    
    # tests here?
    
    # write all data to one big json file
    all_data = {
        'progress': progress_data,
        'timeline': milestones,
        'state': state_charts_data,
        'top_states': top_states_data,
        'doses': daily_data
    }
    with open(DATA_EXPORT_PATH, 'w') as fp:
        json.dump(all_data, fp)
    
    # with open('progress.json', 'w') as fp:
    #     json.dump(progress_data, fp)
        
    # with open('timeline.json', 'w', encoding='utf8') as fp:
    #     json.dump(milestones, fp)
        
    # with open('state.json', 'w') as fp:
    #     json.dump(state_charts_data, fp)
        
    # with open('doses.json', 'w') as fp:
    #     json.dump(daily_data, fp)