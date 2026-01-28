from datetime import timedelta
def seconds_to_hms(seconds: int): 
    hours = seconds // 3600 
    minutes = (seconds % 3600) // 60 
    secs = seconds % 60 
    return f'{hours:02d}:{minutes:02d}:{secs:02d}'
def estimate_xp_from_points(points: int, difficulty: int = 1): 
    return points * max(1, difficulty)
