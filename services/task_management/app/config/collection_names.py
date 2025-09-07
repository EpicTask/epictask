"""
Collection names configuration for task management service.
This matches the collection names defined in the React Native app.
"""

class TestCollections:
    """Test environment collection names"""
    TASKS = 'test_tasks'
    TASK_EVENTS = 'test_task_events'
    USER_EVENTS = 'test_user_events'
    CONTRACTS = 'test_contracts'
    INTERACTIONS = 'test_interactions'
    LEADERBOARD = 'test_leaderboard'
    PAID_TASKS = 'test_paid_tasks'
    TASK_COMMENTS = 'test_task_comments'
    XRPL_SERVICE = 'test_xrpl_service'
    XUMM_CALLBACKS = 'test_xumm_callbacks'
    USERS = 'users'
    REWARDS = 'test_rewards'


class ProdCollections:
    """Production environment collection names"""
    TASKS = 'tasks'
    TASK_EVENTS = 'task_events'
    USER_EVENTS = 'user_events'
    CONTRACTS = 'contracts'
    INTERACTIONS = 'interactions'
    LEADERBOARD = 'leaderboard'
    PAID_TASKS = 'paid_tasks'
    TASK_COMMENTS = 'task_comments'
    XRPL_SERVICE = 'xrpl_service'
    XUMM_CALLBACKS = 'xumm_callbacks'
    USERS = 'users'
    REWARDS = 'rewards'


def get_collections(environment='test'):
    """
    Get collection names for the specified environment.
    
    Args:
        environment (str): 'test' or 'production'
        
    Returns:
        Collection class with collection names
    """
    if environment.lower() == 'production':
        return ProdCollections
    return TestCollections
