from django.dispatch import Signal

providing_args: ['activity_log']
activity_completed = Signal()
reward_claimed = Signal()
