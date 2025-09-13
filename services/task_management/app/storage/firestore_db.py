from datetime import datetime, timedelta
import os
from firebase_admin import firestore

from schema.schema import TaskCreated, LeaderboardEntry, TaskEvent
from config.error_handler import (
    FirestoreOperationException,
    handle_firestore_exception,
)
from config.collection_names import get_collections
from config.firebase_config import db


# Get environment from environment variable, default to 'test'
ENVIRONMENT = os.getenv('ENVIRONMENT', 'test')
collections = get_collections(ENVIRONMENT)


def create_task(response: TaskCreated):
    """Store new task in Firestore database"""
    try:
        # Create a reference to the tasks collection
        collection_ref = db.collection(collections.TASKS)

        # Generate a custom document ID
        doc_ref = collection_ref.document()

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        # Set the response data in the document
        doc_ref.set(data)

        # Get the generated document ID
        doc_id = doc_ref.id

        # Update the document with the generated ID
        doc_ref.update(
            {
                "rating": 0,
                "rewarded": False,
                "task_id": doc_id,
                "timestamp": firestore.SERVER_TIMESTAMP,
            }
        )

        # Create TaskEvent for task creation
        task_event = TaskEvent(
            event_id="",  # Will be set by write_event_to_firestore
            event_type="TaskCreated",
            timestamp="",  # Will be set by write_event_to_firestore
            task_id=doc_id,
            user_id=response.user_id,
            status="created",
            additional_data={
                "task_title": response.task_title,
                "reward_amount": response.reward_amount,
                "reward_currency": response.reward_currency,
                "payment_method": response.payment_method
            }
        )
        write_event_to_firestore(task_event)

        # Return the custom document ID
        return doc_id
    # Handle any errors that occur during the Firestore operation
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def update_task(response):
    """Update the fields of a task"""
    try:
        # Create a reference to the tasks collection
        collection_ref = db.collection(collections.TASKS)

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]
        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        # Update the document with the generated ID
        doc_ref.update(data)

        # Return the custom document ID
        return doc_id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def update_task_fields(response):
    """Update the fields of a task"""
    try:
        # Create a reference to the tasks collection
        collection_ref = db.collection(collections.TASKS)

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]
        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        fields = data["updated_fields"]
        # Update the document with the generated ID
        doc_ref.update(fields)

        # Return the custom document ID
        return doc_id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def assign_task(response):
    """Assign a task to a user"""
    try:
        # Create a reference to the tasks collection
        collection_ref = db.collection(collections.TASKS)

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]

        # Add the assigned_to_id to the assigned_to_ids array
        assigned_to_id = data["assigned_to_id"]

        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        # Get the task data to extract user info for event
        task_doc = doc_ref.get()
        task_data = task_doc.to_dict() if task_doc.exists else {}

        # Update the document with the generated ID
        doc_ref.update({"assigned_to_ids": firestore.ArrayUnion([assigned_to_id])})

        # Create TaskEvent for task assignment
        task_event = TaskEvent(
            event_id="",  # Will be set by write_event_to_firestore
            event_type="TaskAssigned",
            timestamp="",  # Will be set by write_event_to_firestore
            task_id=doc_id,
            user_id=assigned_to_id,
            status="assigned",
            additional_data={
                "assigned_to_id": assigned_to_id,
                "task_creator": task_data.get("user_id"),
                "task_title": task_data.get("task_title")
            }
        )
        write_event_to_firestore(task_event)

        # Return the custom document ID
        return doc_id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def delete_task(response):
    """Delete a task from the Firestore database"""
    try:
        # Create a reference to the tasks collection
        collection_ref = db.collection(collections.TASKS)

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]

        # Check if "smart_contract_enabled" field exists and its value is true
        doc_ref = collection_ref.document(doc_id)
        doc = doc_ref.get().to_dict()

        if (
            doc.get("smart_contract_enabled")
            and doc.get("smart_contract_enabled") is True
        ):
            return "Unable to delete Task due to active smart contract"

        # Create TaskEvent for task cancellation before deletion
        task_event = TaskEvent(
            event_id="",  # Will be set by write_event_to_firestore
            event_type="TaskCancelled",
            timestamp="",  # Will be set by write_event_to_firestore
            task_id=doc_id,
            user_id=doc.get("user_id", ""),
            status="cancelled",
            additional_data={
                "task_title": doc.get("task_title"),
                "reason": "Task deleted by user",
                "smart_contract_enabled": doc.get("smart_contract_enabled", False)
            }
        )
        write_event_to_firestore(task_event)

        # Delete document
        doc_ref.delete()

        return doc_id

    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def completed_task(response):
    """Mark a task as completed"""
    try:
        # Create a reference to the tasks collection
        collection_ref = db.collection(collections.TASKS)

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]
        doc_ref = collection_ref.document(doc_id)

        # Get the task data to extract user info for event
        task_doc = doc_ref.get()
        task_data = task_doc.to_dict() if task_doc.exists else {}

        # Check if the user_id is task owner
        if data["verified"] is None or data["verified"] is False:
            doc_ref.update({"marked_completed": data["marked_completed"]})

        # Create TaskEvent for task completion
        task_event = TaskEvent(
            event_id="",  # Will be set by write_event_to_firestore
            event_type="TaskCompleted",
            timestamp="",  # Will be set by write_event_to_firestore
            task_id=doc_id,
            user_id=data["completed_by_id"],
            status="completed",
            additional_data={
                "marked_completed": data.get("marked_completed"),
                "verified": data.get("verified"),
                "verification_method": data.get("verification_method"),
                "attachments": data.get("attachments", [])
            }
        )
        write_event_to_firestore(task_event)

        # Return the custom document ID
        return doc_id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def get_tasks(user_id: str):
    """Get all tasks"""
    doc_output = []
    try:
        task_events = db.collection(collections.TASKS).where("user_id", "==", user_id)
        docs = task_events.stream()

        for doc in docs:
            doc_output.append(doc.to_dict())

        return {"docs": doc_output}

    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def get_task(task_id: str):
    """Get task by task ID"""
    try:
        task_event = db.collection(collections.TASKS).document(task_id)
        doc = task_event.get()

        if doc.exists:
            doc_output = doc.to_dict()
            return doc_output
        return "No task found with the given task_id"

    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


# Write comments to comments collection


def write_comment(response):
    """Add comment to the Firestore database"""
    try:
        # Create a reference to the task comments collection
        collection_ref = db.collection(collections.TASK_COMMENTS)

        # Convert the TaskEvent object to a JSON string
        data = response.dict()
        # Get task_id to create/update document
        doc_id = data["task_id"]
        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        # Update the document with the generated ID
        doc_ref.set(data)
        # Update the document with the generated ID
        doc_ref.update({"timestamp": firestore.SERVER_TIMESTAMP})

        # Return the custom document ID
        return doc_id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def write_event_to_firestore(response: TaskEvent):
    """Store the event in Firestore database"""
    try:
        # Create a reference to the task events collection
        collection_ref = db.collection(collections.TASK_EVENTS)

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        # Generate a custom document ID
        doc_ref = collection_ref.document()

        # Update the document with the generated ID
        doc_ref.set(data)

        doc_ref.update(
            {"event_id": doc_ref.id, "timestamp": firestore.SERVER_TIMESTAMP}
        )
        # Return the custom document ID
        return doc_ref.id
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


# Leaderboard logic


def update_leaderboard(response):
    """Update the leaderboard for the user"""
    try:
        # Get the paid task document data
        task_data = response

        # Get the first value from assigned_to_ids array
        assigned_to_id = task_data.assigned_to_ids[0]

        # Increment the task count for the user in the leaderboard
        leaderboard_ref = db.collection(collections.LEADERBOARD).document(assigned_to_id)

        leaderboard_entry = leaderboard_ref.get()

        if leaderboard_entry.exists:
            # Update existing entry
            current_tasks_completed = leaderboard_entry.get("tasks_completed")
            tasks_completed = current_tasks_completed + 1
            if task_data.reward_currency == "XRP":
                xrp_earned = task_data.reward_amount + leaderboard_entry.get(
                    "xrp_earned"
                )
                eTask_earned = leaderboard_entry.get("eTask_earned")
            elif task_data.reward_currency == "eTask":
                eTask_earned = task_data.reward_amount + leaderboard_entry.get(
                    "eTask_earned"
                )
                xrp_earned = leaderboard_entry.get("xrp_earned")
            leaderboard_ref.update(
                {
                    "tasks_completed": tasks_completed,
                    "eTask_earned": eTask_earned,
                    "xrp_earned": xrp_earned,
                    "lastUpdated": firestore.SERVER_TIMESTAMP,
                }
            )
        else:
            # Create new entry
            if task_data.reward_currency == "XRP":
                xrp_earned = task_data.reward_amount
                eTask_earned = 0.0
            elif task_data.reward_currency == "eTask":
                eTask_earned = task_data.reward_amount
                xrp_earned = 0.0
            leaderboard_entry_data = LeaderboardEntry(
                user_id=assigned_to_id,
                tasks_completed=1,
                xrp_earned=xrp_earned,
                eTask_earned=eTask_earned,
            )
            leaderboard_ref.set(leaderboard_entry_data.dict())
            leaderboard_ref.update({"lastUpdated": firestore.SERVER_TIMESTAMP})

        return f"Leaderboard updated for user {assigned_to_id}"
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)

def get_task_summary(user_id):
    """Get task summary for a user."""
    try:
        tasks_ref = db.collection(collections.TASKS)
        
        # Get all tasks for user
        all_tasks_query = tasks_ref.where('assigned_to_ids', 'array_contains', user_id)
        all_tasks = all_tasks_query.get()
        
        # Count by status
        completed_count = 0
        in_progress_count = 0
        
        for task in all_tasks:
            task_data = task.to_dict()
            status = task_data.get('status', '').lower()
            if status == 'completed':
                completed_count += 1
            elif status == 'in_progress' or status == 'assigned':
                in_progress_count += 1
        
        return {
            "completed": completed_count,
            "in_progress": in_progress_count,
            "total": len(all_tasks)
        }
    except Exception as e:
        print(f"Error getting task summary: {e}")
        return {"completed": 0, "in_progress": 0, "total": 0}

def get_recent_tasks(user_id, limit, days):
    """Get recent tasks for a user."""
    tasks_ref = db.collection(collections.TASKS)
    start_date = datetime.now() - timedelta(days=days)
    
    query = tasks_ref.where('assigned_to_ids', 'array_contains', user_id) \
                     .where('timestamp', '>=', start_date) \
                     .order_by('timestamp', direction=firestore.Query.DESCENDING) \
                     .limit(limit)
                     
    tasks = [doc.to_dict() for doc in query.get()]
    return tasks

def get_user_rewards(user_id):
    """Get rewards for a user."""
    try:
        rewards_ref = db.collection(collections.PAID_TASKS).document(user_id)
        rewards = rewards_ref.get()
        
        if not rewards.exists:
            return {"tokens_earned": 0, "level": 1, "rank": 0}
        
        reward_data = rewards.to_dict()
        tokens_earned = reward_data.get('tokens_earned', 0)
        
        # Calculate level: Level = floor(tokens_earned / 1000) + 1
        level = int(tokens_earned // 1000) + 1
        
        # Get rank from leaderboard
        rank = get_user_rank(user_id, tokens_earned)
        
        return {
            "tokens_earned": tokens_earned,
            "level": level,
            "rank": rank
        }
    except Exception as e:
        print(f"Error getting user rewards: {e}")
        return {"tokens_earned": 0, "level": 1, "rank": 0}

def get_user_rank(user_id, tokens_earned):
    """Calculate user's rank based on tokens earned."""
    try:
        leaderboard_ref = db.collection(collections.LEADERBOARD)
        # Count users with more tokens
        higher_users = leaderboard_ref.where('tokens_earned', '>', tokens_earned).get()
        return len(higher_users) + 1
    except Exception as e:
        print(f"Error calculating user rank: {e}")
        return 0

def get_global_leaderboard():
    """Get the global leaderboard."""
    leaderboard_ref = db.collection(collections.LEADERBOARD)
    query = leaderboard_ref.order_by('tokens_earned', direction=firestore.Query.DESCENDING).limit(100)
    
    leaderboard = [doc.to_dict() for doc in query.get()]
    return leaderboard

def get_children_rewards(parent_id):
    """Get rewards for a parent's children."""
    users_ref = db.collection(collections.USERS).document(parent_id)
    parent = users_ref.get()
    
    if not parent.exists:
        return []
        
    child_ids = parent.to_dict().get('children', [])
    
    if not child_ids:
        return []
        
    rewards_ref = db.collection(collections.REWARDS)
    query = rewards_ref.where('user_id', 'in', child_ids)
    
    rewards = [doc.to_dict() for doc in query.get()]
    return rewards

# Admin/Metrics Functions
def get_user_metrics():
    """Get comprehensive user metrics."""
    try:
        users_ref = db.collection(collections.USERS)
        all_users = users_ref.get()
        
        total_users = len(all_users)
        parent_users = 0
        child_users = 0
        
        # Count user types
        for user in all_users:
            user_data = user.to_dict()
            role = user_data.get('role', 'child')
            if role == 'parent':
                parent_users += 1
            else:
                child_users += 1
        
        # Calculate active users (users with recent activity)
        # For now, using mock calculation
        active_users = int(total_users * 0.7)  # 70% active rate
        
        return {
            'total_users': total_users,
            'active_users': active_users,
            'parent_users': parent_users,
            'child_users': child_users,
            'registration_trends': {
                'daily': 2,
                'weekly': 8,
                'monthly': total_users
            },
            'last_updated': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error getting user metrics: {e}")
        return {
            'total_users': 0,
            'active_users': 0,
            'parent_users': 0,
            'child_users': 0,
            'registration_trends': {'daily': 0, 'weekly': 0, 'monthly': 0},
            'last_updated': datetime.now().isoformat()
        }

def get_task_metrics():
    """Get comprehensive task metrics."""
    try:
        tasks_ref = db.collection(collections.TASKS)
        all_tasks = tasks_ref.get()
        
        total_tasks = len(all_tasks)
        completed_tasks = 0
        in_progress_tasks = 0
        cancelled_tasks = 0
        tasks_by_user = {}
        
        for task in all_tasks:
            task_data = task.to_dict()
            status = task_data.get('status', '').lower()
            user_id = task_data.get('user_id', 'unknown')
            
            # Count by status
            if status == 'completed':
                completed_tasks += 1
            elif status in ['in_progress', 'assigned']:
                in_progress_tasks += 1
            elif status == 'cancelled':
                cancelled_tasks += 1
            
            # Count by user
            if user_id in tasks_by_user:
                tasks_by_user[user_id] += 1
            else:
                tasks_by_user[user_id] = 1
        
        completion_rate = completed_tasks / total_tasks if total_tasks > 0 else 0
        
        return {
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'cancelled_tasks': cancelled_tasks,
            'completion_rate': completion_rate,
            'average_duration_hours': 24.5,  # Mock data
            'tasks_by_user': [
                {'user_id': uid, 'tasks_created': count} 
                for uid, count in sorted(tasks_by_user.items(), key=lambda x: x[1], reverse=True)[:10]
            ],
            'last_updated': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error getting task metrics: {e}")
        return {
            'total_tasks': 0,
            'completed_tasks': 0,
            'in_progress_tasks': 0,
            'cancelled_tasks': 0,
            'completion_rate': 0,
            'average_duration_hours': 0,
            'tasks_by_user': [],
            'last_updated': datetime.now().isoformat()
        }

def get_event_metrics():
    """Get system event metrics."""
    try:
        events_ref = db.collection(collections.TASK_EVENTS)
        all_events = events_ref.get()
        
        total_events = len(all_events)
        event_types = {}
        
        for event in all_events:
            event_data = event.to_dict()
            event_type = event_data.get('event_type', 'unknown')
            
            if event_type in event_types:
                event_types[event_type] += 1
            else:
                event_types[event_type] = 1
        
        # Calculate events in last 24 hours
        yesterday = datetime.now() - timedelta(days=1)
        recent_events = events_ref.where('timestamp', '>=', yesterday).get()
        events_last_24h = len(recent_events)
        
        error_count = event_types.get('error', 0)
        error_rate = error_count / total_events if total_events > 0 else 0
        
        return {
            'total_events': total_events,
            'event_types': event_types,
            'events_last_24h': events_last_24h,
            'error_rate': error_rate,
            'last_updated': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error getting event metrics: {e}")
        return {
            'total_events': 0,
            'event_types': {},
            'events_last_24h': 0,
            'error_rate': 0,
            'last_updated': datetime.now().isoformat()
        }

def get_performance_metrics():
    """Get system performance metrics."""
    try:
        # Mock performance data - in real implementation, this would come from monitoring systems
        return {
            'api_response_times': {
                'user_management': 245,
                'task_management': 180,
                'xrpl_service': 320
            },
            'database_query_times': {
                'average': 85,
                'p95': 150,
                'p99': 280
            },
            'error_rates': {
                'user_management': 0.005,
                'task_management': 0.008,
                'xrpl_service': 0.012
            },
            'uptime_percentage': 99.8,
            'last_updated': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error getting performance metrics: {e}")
        return {
            'api_response_times': {},
            'database_query_times': {},
            'error_rates': {},
            'uptime_percentage': 0,
            'last_updated': datetime.now().isoformat()
        }

def clear_test_data():
    """Clear test data from test collections."""
    try:
        # Only allow clearing test data, not production
        test_collections = ['tasks-test', 'users-test', 'rewards-test', 'events-test']
        
        for collection_name in test_collections:
            collection_ref = db.collection(collection_name)
            docs = collection_ref.get()
            
            for doc in docs:
                doc.reference.delete()
        
        return {
            'success': True,
            'message': f'Cleared {len(test_collections)} test collections',
            'collections_cleared': test_collections,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error clearing test data: {e}")
        return {
            'success': False,
            'message': f'Failed to clear test data: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }
