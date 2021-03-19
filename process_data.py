import requests
from io import StringIO
import pandas as pd
import numpy as np
import json
from pathlib import Path
from scipy import stats

EXPORT_FOLDER = 'src/components/data'
Path(EXPORT_FOLDER).mkdir(parents=True, exist_ok=True)

MOVING_AVG = 7
BR_ADULT_POP = 160911631
BR_TOTAL_POP = 211755692
BR_PCT_ADULT_POP = BR_ADULT_POP / BR_TOTAL_POP
# https://ftp.ibge.gov.br/Estimativas_de_Populacao/Estimativas_2020/
BR_PCT_ADULT_POP = 1
ADULT_POPULATION = {
    'AC': round(894470 * BR_PCT_ADULT_POP),
    'AL': round(3351543 * BR_PCT_ADULT_POP),
    'AP': round(861773 * BR_PCT_ADULT_POP),
    'AM': round(4207714 * BR_PCT_ADULT_POP),
    'BA': round(14930634 * BR_PCT_ADULT_POP),
    'CE': round(9187103 * BR_PCT_ADULT_POP),
    'DF': round(3055149 * BR_PCT_ADULT_POP),
    'ES': round(4064052 * BR_PCT_ADULT_POP),
    'GO': round(7113540 * BR_PCT_ADULT_POP),
    'MA': round(7114598 * BR_PCT_ADULT_POP),
    'MT': round(3526220 * BR_PCT_ADULT_POP),
    'MS': round(2809394 * BR_PCT_ADULT_POP),
    'MG': round(21292666 * BR_PCT_ADULT_POP),
    'PA': round(8690745 * BR_PCT_ADULT_POP),
    'PB': round(4039277 * BR_PCT_ADULT_POP),
    'PR': round(11516840 * BR_PCT_ADULT_POP),
    'PE': round(9616621 * BR_PCT_ADULT_POP),
    'PI': round(3281480 * BR_PCT_ADULT_POP),
    'RJ': round(17366189 * BR_PCT_ADULT_POP),
    'RN': round(3534165 * BR_PCT_ADULT_POP),
    'RS': round(11422973 * BR_PCT_ADULT_POP),
    'RO': round(1796460 * BR_PCT_ADULT_POP),
    'RR': round(631181 * BR_PCT_ADULT_POP),
    'SC': round(7252502 * BR_PCT_ADULT_POP),
    'SP': round(46289333 * BR_PCT_ADULT_POP),
    'SE': round(2318822 * BR_PCT_ADULT_POP),
    'TO': round(1590248 * BR_PCT_ADULT_POP),
    'WRL': BR_ADULT_POP,
}


def request_data():
    headers = {
    'authority': 'arte.folha.uol.com.br',
    'pragma': 'no-cache',
    'cache-control': 'no-cache',
    # 'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
    'accept': 'application/json, text/plain, */*',
    # 'sec-ch-ua-mobile': '?0',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://arte.folha.uol.com.br/ciencia/2021/veja-como-esta-a-vacinacao/brasil/',
    'accept-language': 'pt-BR',
    }
    response = requests.get('https://arte.folha.uol.com.br//databases/ciencia/2021/vacina/consortium.csv', headers=headers)
    csv_string = StringIO(response.content.decode('utf-8'))
    df = pd.read_csv(csv_string, sep=",")
    return df


def project_data(df, code, outliers=False):
    code = code
    pop = ADULT_POPULATION[code]
    df_tmp = df[df.code == code]
    df_tmp['new_first_shot'] = abs(df_tmp.total_first_shot.diff())

    df_tmp['coverage_first_shot'] = df_tmp['coverage_first_shot'] / 100
    df_tmp['projected'] = False

    # find outliers
    # df_o = df_tmp[df_tmp['new_first_shot'] > 0][['new_first_shot']]  # discard NaNs and zeros
    df_o = df_tmp[df_tmp['new_first_shot'].notna()][['new_first_shot']]  # discard NaNs

    # # strategy 1: global
    # min_std = 3  # min standard deviation for outliers
    # df_o['outlier'] = stats.zscore(df_o) >= min_std
    # # strategy 2: rolling
    periods_for_outlier = 14
    min_std = 3  # min standard deviation for outliers
    df_o['outlier'] = (df_o - df_o.rolling(periods_for_outlier).mean()) / df_o.rolling(periods_for_outlier).std() > min_std

    df_tmp = df_tmp.join(df_o['outlier'])  # join back to df
    df_tmp['outlier'] = df_tmp['outlier'].fillna(value=False)

    # moving average
    latest = df_tmp.sort_values('date', ascending=False)[:MOVING_AVG]
    if outliers is True:
        # remove outliers
        latest = latest[latest['outlier'] == False]
    mean_new_first_shot_per_day = round(latest['new_first_shot'].mean())

    max_row = latest.iloc[0]
    coverage = max_row['coverage_first_shot']
    first_shot = max_row['total_first_shot']
    date = max_row['date']
    new_rows = []
    while coverage <= 1:
        date += pd.Timedelta(days=1)
        first_shot += mean_new_first_shot_per_day
        coverage = first_shot / pop
        new_rows.append({
            'code': code,
            'date': date,
            'total_first_shot': first_shot,
            'new_first_shot': np.NaN,
            'coverage_first_shot': first_shot / pop,
            'projected': True,
            'outlier': False,
        })

    cols = ['code', 'date', 'total_first_shot', 'new_first_shot', 'coverage_first_shot', 'projected', 'outlier']
    df_projected = pd.concat([df_tmp[cols], pd.DataFrame(new_rows)]).sort_values('date')

    COVERAGE_MILESTONES = [0.5, 0.7, 0.9, 1]
    milestone_rows = []
    for milestone in COVERAGE_MILESTONES:
        row = df_projected.iloc[(df_projected['coverage_first_shot'] - milestone).abs().argsort()[:1]]
        row['milestone'] = milestone
        milestone_rows.append(row.iloc[0])
        # idx = df_projected['coverage_first_shot'].sub(milestone).abs().idxmin()
        # row = df_projected.loc[idx]
        # milestone_rows.append(row)

    df_milestones = pd.DataFrame(milestone_rows)
    df_final = pd.concat([df_tmp[cols], df_milestones]).sort_values('date')
    df_final['milestone'] = df_final['milestone'].fillna(value=False)
    df_final['new_first_shot'] = df_final['new_first_shot'].fillna(value=False)

    ma_col = f'new_first_shot_mov_avg'
    df_final[ma_col] = df_final['new_first_shot'].rolling(window=MOVING_AVG).mean().round()
    if outliers is True:
        # ignore outliers
        df_final['new_first_shot_corrected'] = np.where(df_final['outlier'] == True, df_final['new_first_shot'].shift(-1), df_final['new_first_shot'])
        df_final[ma_col] = df_final['new_first_shot_corrected'].rolling(window=MOVING_AVG).mean().round()
        del df_final['new_first_shot_corrected']
    df_final[ma_col] = df_final[ma_col].fillna(value=False)

    return df_final, df_milestones

df = request_data()
df['date'] = pd.to_datetime(df.date)
df.head()
pd.options.mode.chained_assignment = None

final_frames = []
milestone_frames = []
for state in ADULT_POPULATION:
    print(f'---> state {state}')
    df_final, df_milestones = project_data(df, state)
    final_frames.append(df_final)
    milestone_frames.append(df_milestones)

milestones = {}
for state_frame in milestone_frames:
    code = state_frame.iloc[0].code
    state_frame['date'] = state_frame['date'].dt.strftime('%Y-%m-%d')
    milestones[code] = state_frame.drop('code', 1).to_dict(orient='records')

final = {}
for state_frame in final_frames:
    code = state_frame.iloc[0].code
    state_frame['date'] = state_frame['date'].dt.strftime('%Y-%m-%d')
    final[code] = state_frame.drop('code', 1).to_dict(orient='records')


df_final = pd.concat(final_frames)
df_milestones = df_final[df_final['milestone'] > 0]

latest_date = df_final[df_final.projected == False].date.max()
df_latest = df_final[df_final.date == latest_date]

df_milestones['days_until'] = (pd.to_datetime(df_milestones.date) - pd.to_datetime(latest_date)).dt.days

df_milestones.to_json(f'{EXPORT_FOLDER}/milestones.json', orient='records')
df_latest.to_json(f'{EXPORT_FOLDER}/latest.json', orient='records')

# df_milestones['date'] = pd.to_datetime(df_milestones['date'])
# max_milestone_date = df_milestones.sort_values('date', ascending=False)['date'].dt.strftime('%Y-%m-%d').iloc[0]
# with open(f'{EXPORT_FOLDER}/max_milestone_date.json', 'w') as f:
#     json.dump({'max_milestone_date': max_milestone_date}, f)

# milestones = pd.concat(milestone_frames)
# final.to_json(ff'{EXPORT_FOLDER}/projections.json', orient='records')
# milestones.to_json(ff'{EXPORT_FOLDER}/milestones.json', orient='records')

with open(f'{EXPORT_FOLDER}/projections.json', 'w') as f:
    json.dump(final, f)

updated_at = df.sort_values('date', ascending=False)['date'].dt.strftime('%Y-%m-%d').iloc[0]
with open(f'{EXPORT_FOLDER}/updated_at.json', 'w') as f:
    json.dump({'updated_at': updated_at}, f)
