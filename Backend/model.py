import math
import random

def predict(month_index, year, hospital_factor=1):
    daily_predictions = []
    
    # Base monthly variations
    base_pm25 = 65 + month_index * 1.2
    base_pm10 = 110 + month_index * 1.5
    base_aqi = 145 + month_index * 1.3
    
    growth = (year - 2024) * 5
    
    for day in range(1, 31):
        # Create highly dynamic "up and down" graph lines using aggressive random spikes and seasonal waves
        season_wave = math.sin((month_index / 11) * math.pi) * 40
        random_spike = (random.random() - 0.5) * 60
        trend = (year - 2024) * 2 + day * 0.2
        
        aqi_val = base_aqi + growth + season_wave + random_spike + trend
        aqi = max(30, int(aqi_val))
        
        # Intense localized variance
        pm25 = max(10, int(aqi * (0.35 + (random.random() * 0.4 - 0.2))))
        pm10 = max(15, int(aqi * (0.55 + (random.random() * 0.5 - 0.25))))
        no2 = max(5, int(aqi * (0.15 + (random.random() * 0.2 - 0.1))))
        
        cases = max(0, int((aqi * 0.8) * hospital_factor + (random.random() - 0.5)*20 + (day % 5)))
        
        # Air pollution disease breakdown mapped to total hospital load
        copd = max(0, int(cases * (0.10 + random.random() * 0.05)))
        ihd = max(0, int(cases * (0.08 + random.random() * 0.04))) 
        stroke = max(0, int(cases * (0.15 + random.random() * 0.05)))
        lung_cancer = max(0, int(cases * (0.10 + random.random() * 0.05)))
        pneumonia = max(0, int(cases * (0.15 + random.random() * 0.05)))
        
        daily_predictions.append({
            "day": day,
            "aqi": aqi,
            "pm25": pm25,
            "pm10": pm10,
            "no2": no2,
            "cases": cases,
            "copd": copd,
            "ihd": ihd,
            "stroke": stroke,
            "lung_cancer": lung_cancer,
            "pneumonia": pneumonia
        })

    return {
        "month_index": month_index,
        "year": year,
        "hospital_factor": hospital_factor,
        "daily_data": daily_predictions
    }