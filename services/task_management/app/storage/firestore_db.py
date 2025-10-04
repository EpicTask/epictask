from datetime import datetime, timedelta
import os
from firebase_admin import firestore

from ..schema.schema import (
    TaskCommentAdded,
    TaskCompleted,
    TaskCreated,
    LeaderboardEntry,
    ComprehensiveRewards,
    FamilyLeaderboard,
    KidLeaderboardView,
    TaskEvent,
    TaskUpdated,
)
from ..config.error_handler import (
    FirestoreOperationException,
    handle_firestore_exception,
)
from ..config.collection_names import get_collections
from ..config.firebase_config import db


# Get environment from environment variable, default to 'test'
ENVIRONMENT = os.getenv("ENVIRONMENT", "test")
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
                "payment_method": response.payment_method,
            },
        )
        write_event_to_firestore(task_event)

        return doc_id
    # Handle any errors that occur during the Firestore operation
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def update_task(event_type, response):
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
        task_event = TaskEvent(
            event_id="",  # Will be set by write_event_to_firestore
            event_type=event_type,
            timestamp="",  # Will be set by write_event_to_firestore
            task_id=doc_id,
            user_id=data["user_id"],
            status="updated",
            additional_data=data,
        )
        write_event_to_firestore(task_event)
        return "Task successfully updated"
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def add_comment(response: TaskCommentAdded):
    """Create comment for of a task"""
    try:
        # Create a reference to the comments collection
        collection_ref = db.collection(collections.TASK_COMMENTS)

        # Convert the TaskEvent object to a JSON string
        data = response.model_dump()

        doc_id = response.task_id
        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        # Update the document with the generated ID
        doc_ref.set(data)
        task_event = TaskEvent(
            event_id="",  # Will be set by write_event_to_firestore
            event_type="TaskCommentAdded",
            timestamp="",  # Will be set by write_event_to_firestore
            task_id=doc_id,
            user_id=response.user_id,
            status="updated",
            additional_data={"comment": response.comment},
        )
        write_event_to_firestore(task_event)
        return "Task successfully updated"
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def update_task_fields(task_event, response: TaskUpdated):
    """Update the fields of a task"""
    try:
        # Create a reference to the tasks collection
        collection_ref = db.collection(collections.TASKS)

        # Convert the TaskEvent object to a JSON string
        data = response.model_dump()

        doc_id = data["task_id"]
        # Generate a custom document ID
        doc_ref = collection_ref.document(doc_id)

        fields = data["updated_fields"]
        # Update the document with the generated ID
        doc_ref.update(fields)

        # Create TaskEvent for task update
        task_event = TaskEvent(
            event_id="",  # Will be set by write_event_to_firestore
            event_type="TaskUpdated",
            timestamp="",  # Will be set by write_event_to_firestore
            task_id=doc_id,
            user_id=response.user_id,
            status="updated",
            additional_data=response.updated_fields,
        )
        write_event_to_firestore(task_event)

        return "Task successfully updated"
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def assign_task(task_event, response):
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
                "task_title": task_data.get("task_title"),
            },
        )
        write_event_to_firestore(task_event)

        # Return the custom document ID
        return "Task successfully assigned"
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def delete_task(task_event, response):
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
                "smart_contract_enabled": doc.get("smart_contract_enabled", False),
            },
        )
        write_event_to_firestore(task_event)

        # Delete document
        doc_ref.delete()

        return "Task successfully deleted"

    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def completed_task(response: TaskCompleted):
    """Mark a task as completed"""
    try:
        # Create a reference to the tasks collection
        collection_ref = db.collection(collections.TASKS)

        doc_id = response.task_id
        doc_ref = collection_ref.document(doc_id)

        # Check if the user_id is task owner
        if response.verified is None or response.verified is False:
            doc_ref.update({"marked_completed": response.marked_completed})

        # Create TaskEvent for task completion
        task_event = TaskEvent(
            event_id="",  # Will be set by write_event_to_firestore
            event_type="TaskCompleted",
            timestamp="",  # Will be set by write_event_to_firestore
            task_id=doc_id,
            user_id=response.completed_by_id,
            status="completed",
            additional_data={
                "marked_completed": response.marked_completed,
                "verified": response.verified,
                "verification_method": response.verification_method,
                "attachments": response.attachments or [],
            },
        )
        write_event_to_firestore(task_event)

        return "Congratulations on completing the task!"
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def task_expired(response):
    """Mark a task as expired"""
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

        # Update the document with the generated ID
        doc_ref.update({"status": "expired"})

        # Create TaskEvent for task expiration
        task_event = TaskEvent(
            event_id="",  # Will be set by write_event_to_firestore
            event_type="TaskExpired",
            timestamp="",  # Will be set by write_event_to_firestore
            task_id=doc_id,
            user_id=task_data.get("user_id", ""),
            status="expired",
            additional_data={
                "task_title": task_data.get("task_title"),
                "reason": "Task expired",
            },
        )
        write_event_to_firestore(task_event)

        return "Task successfully marked as expired"
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def task_rating_update(response):
    """Update the rating of a task"""
    try:
        # Create a reference to the tasks collection
        collection_ref = db.collection(collections.TASKS)

        # Convert the TaskEvent object to a JSON string
        data = response.dict()

        doc_id = data["task_id"]
        doc_ref = collection_ref.document(doc_id)

        # Update the document and increment rating by 1
        doc_ref.update({"rating": firestore.Increment(1)})

        task_doc = doc_ref.get()
        task_data = task_doc.to_dict() if task_doc.exists else {}

        # Create TaskEvent for task rating update
        task_event = TaskEvent(
            event_id="",  # Will be set by write_event_to_firestore
            event_type="TaskRatingUpdate",
            timestamp="",  # Will be set by write_event_to_firestore
            task_id=doc_id,
            user_id=task_data.get("user_id", ""),
            status="expired",
            additional_data={
                "task_title": task_data.get("task_title"),
                "reason": "Task expired",
            },
        )
        write_event_to_firestore(task_event)
        return "Task rating successfully updated"
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

        return "Comment successfully added"
    except FirestoreOperationException as e:
        return handle_firestore_exception(e)


def write_event_to_firestore(response: TaskEvent):
    """Store the event in Firestore database"""
    try:
        # Create a reference to the task events collection
        collection_ref = db.collection(collections.TASK_EVENTS)

        # Convert the TaskEvent object to a JSON string
        data = response.model_dump()

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
        leaderboard_ref = db.collection(collections.LEADERBOARD).document(
            assigned_to_id
        )

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
    """Get task summary for a user that created them."""
    try:
        tasks_ref = db.collection(collections.TASKS)

        # Get all tasks for user
        all_tasks_query = tasks_ref.where("user_id", "==", user_id)
        all_tasks = all_tasks_query.get()

        # Count by status
        completed_count = 0
        in_progress_count = 0

        for task in all_tasks:
            task_data = task.to_dict()
            status = task_data.get("rewarded", "")
            if status == True:
                completed_count += 1
            else:
                in_progress_count += 1

        return {
            "completed": completed_count,
            "in_progress": in_progress_count,
            "total": len(all_tasks),
        }
    except Exception as e:
        print(f"Error getting task summary: {e}")
        return {"completed": 0, "in_progress": 0, "total": 0}


def get_kid_task_summary(user_id):
    """Get task summary for a user that created them."""
    try:
        tasks_ref = db.collection(collections.TASKS)

        # Get all tasks for user
        all_tasks_query = tasks_ref.where("assigned_to_ids", "array_contains", user_id)
        all_tasks = all_tasks_query.get()

        # Count by status
        completed_count = 0
        in_progress_count = 0

        for task in all_tasks:
            task_data = task.to_dict()
            status = task_data.get("rewarded", "")
            if status == True:
                completed_count += 1
            else:
                in_progress_count += 1

        return {
            "completed": completed_count,
            "in_progress": in_progress_count,
            "total": len(all_tasks),
        }
    except Exception as e:
        print(f"Error getting task summary: {e}")
        return {"completed": 0, "in_progress": 0, "total": 0}


def get_recent_tasks(user_id, limit, days):
    """Get recent tasks for a user."""
    tasks_ref = db.collection(collections.TASKS)
    start_date = datetime.now() - timedelta(days=days)

    query = (
        tasks_ref.where("assigned_to_ids", "array_contains", user_id)
        .where("timestamp", ">=", start_date)
        .order_by("timestamp", direction=firestore.Query.DESCENDING)
        .limit(limit)
    )

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
        tokens_earned = reward_data.get("tokens_earned", 0)

        # Calculate level: Level = floor(tokens_earned / 1000) + 1
        level = int(tokens_earned // 1000) + 1

        # Get rank from leaderboard
        rank = get_user_rank(user_id, tokens_earned)

        return {"tokens_earned": tokens_earned, "level": level, "rank": rank}
    except Exception as e:
        print(f"Error getting user rewards: {e}")
        return {"tokens_earned": 0, "level": 1, "rank": 0}


def get_user_rank(user_id, tokens_earned):
    """Calculate user's rank based on tokens earned."""
    try:
        leaderboard_ref = db.collection(collections.LEADERBOARD)
        # Count users with more tokens
        higher_users = leaderboard_ref.where("tokens_earned", ">", tokens_earned).get()
        return len(higher_users) + 1
    except Exception as e:
        print(f"Error calculating user rank: {e}")
        return 0


def get_global_leaderboard():
    """Get the global leaderboard."""
    leaderboard_ref = db.collection(collections.LEADERBOARD)
    query = leaderboard_ref.order_by(
        "tokens_earned", direction=firestore.Query.DESCENDING
    ).limit(100)

    leaderboard = [doc.to_dict() for doc in query.get()]
    return leaderboard


def get_children_rewards(parent_id):
    """Get rewards for a parent's children."""
    users_ref = db.collection(collections.USERS).document(parent_id)
    parent = users_ref.get()

    if not parent.exists:
        return []

    child_ids = parent.to_dict().get("children", [])

    if not child_ids:
        return []

    rewards_ref = db.collection(collections.REWARDS)
    query = rewards_ref.where("user_id", "in", child_ids)

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
            role = user_data.get("role", "child")
            if role == "parent":
                parent_users += 1
            else:
                child_users += 1

        # Calculate active users (users with recent activity)
        # For now, using mock calculation
        active_users = int(total_users * 0.7)  # 70% active rate

        return {
            "total_users": total_users,
            "active_users": active_users,
            "parent_users": parent_users,
            "child_users": child_users,
            "registration_trends": {"daily": 2, "weekly": 8, "monthly": total_users},
            "last_updated": datetime.now().isoformat(),
        }
    except Exception as e:
        print(f"Error getting user metrics: {e}")
        return {
            "total_users": 0,
            "active_users": 0,
            "parent_users": 0,
            "child_users": 0,
            "registration_trends": {"daily": 0, "weekly": 0, "monthly": 0},
            "last_updated": datetime.now().isoformat(),
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
            status = task_data.get("status", "").lower()
            user_id = task_data.get("user_id", "unknown")

            # Count by status
            if status == "completed":
                completed_tasks += 1
            elif status in ["in_progress", "assigned"]:
                in_progress_tasks += 1
            elif status == "cancelled":
                cancelled_tasks += 1

            # Count by user
            if user_id in tasks_by_user:
                tasks_by_user[user_id] += 1
            else:
                tasks_by_user[user_id] = 1

        completion_rate = completed_tasks / total_tasks if total_tasks > 0 else 0

        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "cancelled_tasks": cancelled_tasks,
            "completion_rate": completion_rate,
            "average_duration_hours": 24.5,  # Mock data
            "tasks_by_user": [
                {"user_id": uid, "tasks_created": count}
                for uid, count in sorted(
                    tasks_by_user.items(), key=lambda x: x[1], reverse=True
                )[:10]
            ],
            "last_updated": datetime.now().isoformat(),
        }
    except Exception as e:
        print(f"Error getting task metrics: {e}")
        return {
            "total_tasks": 0,
            "completed_tasks": 0,
            "in_progress_tasks": 0,
            "cancelled_tasks": 0,
            "completion_rate": 0,
            "average_duration_hours": 0,
            "tasks_by_user": [],
            "last_updated": datetime.now().isoformat(),
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
            event_type = event_data.get("event_type", "unknown")

            if event_type in event_types:
                event_types[event_type] += 1
            else:
                event_types[event_type] = 1

        # Calculate events in last 24 hours
        yesterday = datetime.now() - timedelta(days=1)
        recent_events = events_ref.where("timestamp", ">=", yesterday).get()
        events_last_24h = len(recent_events)

        error_count = event_types.get("error", 0)
        error_rate = error_count / total_events if total_events > 0 else 0

        return {
            "total_events": total_events,
            "event_types": event_types,
            "events_last_24h": events_last_24h,
            "error_rate": error_rate,
            "last_updated": datetime.now().isoformat(),
        }
    except Exception as e:
        print(f"Error getting event metrics: {e}")
        return {
            "total_events": 0,
            "event_types": {},
            "events_last_24h": 0,
            "error_rate": 0,
            "last_updated": datetime.now().isoformat(),
        }


def get_performance_metrics():
    """Get system performance metrics."""
    try:
        # Mock performance data - in real implementation, this would come from monitoring systems
        return {
            "api_response_times": {
                "user_management": 245,
                "task_management": 180,
                "xrpl_service": 320,
            },
            "database_query_times": {"average": 85, "p95": 150, "p99": 280},
            "error_rates": {
                "user_management": 0.005,
                "task_management": 0.008,
                "xrpl_service": 0.012,
            },
            "uptime_percentage": 99.8,
            "last_updated": datetime.now().isoformat(),
        }
    except Exception as e:
        print(f"Error getting performance metrics: {e}")
        return {
            "api_response_times": {},
            "database_query_times": {},
            "error_rates": {},
            "uptime_percentage": 0,
            "last_updated": datetime.now().isoformat(),
        }


def clear_test_data():
    """Clear test data from test collections."""
    try:
        # Only allow clearing test data, not production
        test_collections = ["tasks-test", "users-test", "rewards-test", "events-test"]

        for collection_name in test_collections:
            collection_ref = db.collection(collection_name)
            docs = collection_ref.get()

            for doc in docs:
                doc.reference.delete()

        return {
            "success": True,
            "message": f"Cleared {len(test_collections)} test collections",
            "collections_cleared": test_collections,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        print(f"Error clearing test data: {e}")
        return {
            "success": False,
            "message": f"Failed to clear test data: {str(e)}",
            "timestamp": datetime.now().isoformat(),
        }


# Enhanced Rewards and Leaderboard Functions

def calculate_total_token_score(xrp_earned, rlusd_earned, etask_earned):
    """Calculate total token score for ranking (without USD conversion)"""
    total_score = (xrp_earned * .3) + (rlusd_earned) + (etask_earned)
    return round(total_score, 2)


def calculate_user_level(total_tokens, tasks_completed):
    """Calculate user level based on token amounts and tasks completed"""
    # Level formula: (total_token_score / 1000) + (tasks_completed / 50)
    total_token_score = calculate_total_token_score(
        total_tokens.get('xrp_earned', 0),
        total_tokens.get('rlusd_earned', 0), 
        total_tokens.get('etask_earned', 0)
    )
    level = int((total_token_score / 1000) + (tasks_completed / 50)) + 1
    return max(1, level)  # Minimum level is 1


def get_comprehensive_rewards(user_id):
    """Get comprehensive rewards data for a user - token-only"""
    try:
        leaderboard_ref = db.collection(collections.LEADERBOARD).document(user_id)
        leaderboard_doc = leaderboard_ref.get()
        
        if not leaderboard_doc.exists:
            # Return default data for new users
            return ComprehensiveRewards(
                user_id=user_id,
                display_name="",
                currencies={
                    "xrp_earned": 0.0,
                    "rlusd_earned": 0.0,
                    "etask_earned": 0.0
                },
                tasks_completed=0,
                level=1,
                family_rank=0,
                global_rank=0,
                token_score=0.0,
                achievements=[],
                next_level_progress=0.0
            )
        
        data = leaderboard_doc.to_dict()
        xrp_earned = data.get("xrp_earned", 0.0)
        rlusd_earned = data.get("rlusd_earned", 0.0)
        etask_earned = data.get("eTask_earned", 0.0)
        tasks_completed = data.get("tasks_completed", 0)
        
        # Calculate token score
        token_score = calculate_total_token_score(xrp_earned, rlusd_earned, etask_earned)
        
        # Calculate level based on tokens
        tokens_dict = {
            'xrp_earned': xrp_earned,
            'rlusd_earned': rlusd_earned,
            'etask_earned': etask_earned
        }
        level = calculate_user_level(tokens_dict, tasks_completed)
        
        # Calculate next level progress based on token score
        current_level_threshold = (level - 1) * 1000
        next_level_threshold = level * 1000
        progress = ((token_score - current_level_threshold) / (next_level_threshold - current_level_threshold)) * 100
        next_level_progress = min(100, max(0, progress))
        
        # Get global rank
        global_rank = get_user_global_rank_by_tokens(user_id, token_score, tasks_completed)
        
        # Get achievements based on token amounts
        achievements = calculate_achievements_by_tokens(xrp_earned, rlusd_earned, etask_earned, tasks_completed, level)
        
        return ComprehensiveRewards(
            user_id=user_id,
            display_name=data.get("display_name", ""),
            currencies={
                "xrp_earned": xrp_earned,
                "rlusd_earned": rlusd_earned,
                "etask_earned": etask_earned
            },
            tasks_completed=tasks_completed,
            level=level,
            family_rank=0,  # Will be calculated in family context
            global_rank=global_rank,
            token_score=token_score,
            achievements=achievements,
            next_level_progress=next_level_progress
        )
        
    except Exception as e:
        print(f"Error getting comprehensive rewards: {e}")
        return ComprehensiveRewards(
            user_id=user_id,
            display_name="",
            currencies={
                "xrp_earned": 0.0,
                "rlusd_earned": 0.0,
                "etask_earned": 0.0
            },
            tasks_completed=0,
            level=1,
            family_rank=0,
            global_rank=0,
            token_score=0.0,
            achievements=[],
            next_level_progress=0.0
        )




def get_family_leaderboard(parent_id):
    """Get family leaderboard for parent view - token-only"""
    try:
        # Get parent's children from users collection
        users_ref = db.collection(collections.USERS).document(parent_id)
        parent_doc = users_ref.get()
        
        if not parent_doc.exists:
            return FamilyLeaderboard(
                family_id=parent_id,
                parent_id=parent_id,
                children=[],
                family_total_tokens=0.0,
                family_total_tasks=0,
                family_global_rank=0
            )
        
        parent_data = parent_doc.to_dict()
        child_ids = parent_data.get("children", [])
        
        if not child_ids:
            return FamilyLeaderboard(
                family_id=parent_id,
                parent_id=parent_id,
                children=[],
                family_total_tokens=0.0,
                family_total_tasks=0,
                family_global_rank=0
            )
        
        # Get comprehensive rewards for each child
        children_rewards = []
        family_total_tokens = 0.0
        family_total_tasks = 0
        
        for i, child_id in enumerate(child_ids):
            child_rewards = get_comprehensive_rewards(child_id)
            child_rewards.family_rank = i + 1  # Will be recalculated after sorting
            children_rewards.append(child_rewards)
            family_total_tokens += child_rewards.token_score
            family_total_tasks += child_rewards.tasks_completed
        
        # Sort children by token score and assign family ranks
        children_rewards.sort(
            key=lambda x: (x.token_score * 0.7) + (x.tasks_completed * 0.3),
            reverse=True
        )
        
        for i, child in enumerate(children_rewards):
            child.family_rank = i + 1
        
        # Calculate family global rank based on token score
        family_global_rank = max(1, int(family_total_tokens / 100))
        
        return FamilyLeaderboard(
            family_id=parent_id,
            parent_id=parent_id,
            children=children_rewards,
            family_total_tokens=family_total_tokens,
            family_total_tasks=family_total_tasks,
            family_global_rank=family_global_rank
        )
        
    except Exception as e:
        print(f"Error getting family leaderboard: {e}")
        return FamilyLeaderboard(
            family_id=parent_id,
            parent_id=parent_id,
            children=[],
            family_total_tokens=0.0,
            family_total_tasks=0,
            family_global_rank=0
        )


def get_kid_leaderboard_view(kid_id):
    """Get kid-specific leaderboard view"""
    try:
        # Get kid's comprehensive rewards
        kid_data = get_comprehensive_rewards(kid_id)
        
        # Find parent to get family context
        users_ref = db.collection(collections.USERS)
        parent_query = users_ref.where("children", "array_contains", kid_id).limit(1)
        parent_docs = parent_query.get()
        
        if not parent_docs:
            # No family context, show individual progress
            return KidLeaderboardView(
                kid_data=kid_data,
                family_position=1,
                family_total_kids=1,
                encouragement_message="You're doing great! Keep completing tasks to earn more rewards!",
                next_milestone={
                    "type": "level",
                    "current": kid_data.level,
                    "next": kid_data.level + 1,
                    "progress": kid_data.next_level_progress
                },
                global_context={
                    "rank": kid_data.global_rank,
                    "message": f"You're ranked #{kid_data.global_rank} globally!"
                }
            )
        
        parent_doc = parent_docs[0]
        parent_id = parent_doc.id
        
        # Get family leaderboard to determine position
        family_leaderboard = get_family_leaderboard(parent_id)
        
        family_position = 1
        family_total_kids = len(family_leaderboard.children)
        
        for i, child in enumerate(family_leaderboard.children):
            if child.user_id == kid_id:
                family_position = i + 1
                break
        
        # Generate encouragement message
        encouragement_messages = [
            "Amazing work! You're crushing those tasks! 🌟",
            "Keep it up, superstar! Every task makes you stronger! 💪",
            "You're on fire! Your hard work is paying off! 🔥",
            "Fantastic job! You're building great habits! 🎯",
            "Way to go! You're earning your way to success! 🏆"
        ]
        
        if family_position == 1:
            encouragement_message = f"🥇 You're #1 in your family! {encouragement_messages[0]}"
        elif family_position <= 3:
            encouragement_message = f"🥉 You're in the top 3! {encouragement_messages[1]}"
        else:
            encouragement_message = encouragement_messages[family_position % len(encouragement_messages)]
        
        # Calculate next milestone
        next_milestone = {
            "type": "level",
            "current": kid_data.level,
            "next": kid_data.level + 1,
            "progress": kid_data.next_level_progress
        }
        
        # Global context
        global_context = {
            "rank": kid_data.global_rank,
            "message": f"You're ranked #{kid_data.global_rank} among all kids!"
        }
        
        return KidLeaderboardView(
            kid_data=kid_data,
            family_position=family_position,
            family_total_kids=family_total_kids,
            encouragement_message=encouragement_message,
            next_milestone=next_milestone,
            global_context=global_context
        )
        
    except Exception as e:
        print(f"Error getting kid leaderboard view: {e}")
        kid_data = get_comprehensive_rewards(kid_id)
        return KidLeaderboardView(
            kid_data=kid_data,
            family_position=1,
            family_total_kids=1,
            encouragement_message="You're doing great! Keep completing tasks to earn more rewards!",
            next_milestone={
                "type": "level",
                "current": kid_data.level,
                "next": kid_data.level + 1,
                "progress": kid_data.next_level_progress
            },
            global_context={
                "rank": kid_data.global_rank,
                "message": f"You're ranked #{kid_data.global_rank} globally!"
            }
        )


def get_user_global_rank_by_tokens(user_id, token_score, tasks_completed):
    """Calculate user's global rank based on token score"""
    try:
        leaderboard_ref = db.collection(collections.LEADERBOARD)
        all_users = leaderboard_ref.get()
        
        user_score = (token_score * 0.7) + (tasks_completed * 0.3)
        higher_users = 0
        
        for user_doc in all_users:
            if user_doc.id == user_id:
                continue
                
            user_data = user_doc.to_dict()
            other_xrp = user_data.get("xrp_earned", 0.0)
            other_rlusd = user_data.get("rlusd_earned", 0.0)
            other_etask = user_data.get("eTask_earned", 0.0)
            other_tasks = user_data.get("tasks_completed", 0)
            
            other_token_score = calculate_total_token_score(other_xrp, other_rlusd, other_etask)
            other_score = (other_token_score * 0.7) + (other_tasks * 0.3)
            
            if other_score > user_score:
                higher_users += 1
        
        return higher_users + 1
        
    except Exception as e:
        print(f"Error calculating global rank by tokens: {e}")
        return 0


def calculate_achievements_by_tokens(xrp_earned, rlusd_earned, etask_earned, tasks_completed, level):
    """Calculate achievements based on token amounts and user progress"""
    achievements = []
    
    # Task-based achievements
    if tasks_completed >= 1:
        achievements.append("First Task Completed")
    if tasks_completed >= 10:
        achievements.append("Task Master")
    if tasks_completed >= 50:
        achievements.append("Task Champion")
    if tasks_completed >= 100:
        achievements.append("Task Legend")
    
    # Token-based achievements
    total_tokens = xrp_earned + rlusd_earned + (etask_earned / 100)  # Normalize eTask for comparison
    
    if total_tokens >= 1:
        achievements.append("First Earnings")
    if total_tokens >= 10:
        achievements.append("Token Collector")
    if total_tokens >= 50:
        achievements.append("Token Master")
    if total_tokens >= 100:
        achievements.append("Token Legend")
    
    # XRP-specific achievements
    if xrp_earned >= 1:
        achievements.append("XRP Earner")
    if xrp_earned >= 10:
        achievements.append("XRP Collector")
    
    # RLUSD-specific achievements
    if rlusd_earned >= 1:
        achievements.append("RLUSD Earner")
    if rlusd_earned >= 10:
        achievements.append("RLUSD Collector")
    
    # eTask-specific achievements
    if etask_earned >= 100:
        achievements.append("eTask Earner")
    if etask_earned >= 1000:
        achievements.append("eTask Collector")
    
    # Level-based achievements
    if level >= 5:
        achievements.append("Rising Star")
    if level >= 10:
        achievements.append("Expert Level")
    if level >= 20:
        achievements.append("Master Level")
    
    return achievements


def update_enhanced_leaderboard(task_data):
    """Update the enhanced leaderboard with token-based scoring for multiple users"""
    try:
        if not task_data.assigned_to_ids or len(task_data.assigned_to_ids) == 0:
            return "No assigned users to update leaderboard"
        
        updated_users = []
        
        # Loop through all assigned users
        for assigned_to_id in task_data.assigned_to_ids:
            try:
                leaderboard_ref = db.collection(collections.LEADERBOARD).document(assigned_to_id)
                leaderboard_entry = leaderboard_ref.get()
                
                # Initialize currency values
                xrp_earned = 0.0
                rlusd_earned = 0.0
                etask_earned = 0.0
                tasks_completed = 1
                
                if leaderboard_entry.exists:
                    # Update existing entry
                    current_data = leaderboard_entry.to_dict()
                    tasks_completed = current_data.get("tasks_completed", 0) + 1
                    xrp_earned = current_data.get("xrp_earned", 0.0)
                    rlusd_earned = current_data.get("rlusd_earned", 0.0)
                    etask_earned = current_data.get("eTask_earned", 0.0)
                
                # Add new reward based on currency
                if task_data.reward_currency.upper() == "XRP":
                    xrp_earned += task_data.reward_amount
                elif task_data.reward_currency.upper() == "RLUSD":
                    rlusd_earned += task_data.reward_amount
                elif task_data.reward_currency.upper() == "ETASK":
                    etask_earned += task_data.reward_amount
                
                # Calculate token score and level
                token_score = calculate_total_token_score(xrp_earned, rlusd_earned, etask_earned)
                tokens_dict = {
                    'xrp_earned': xrp_earned,
                    'rlusd_earned': rlusd_earned,
                    'etask_earned': etask_earned
                }
                level = calculate_user_level(tokens_dict, tasks_completed)
                
                # Update leaderboard entry (no more USD values)
                leaderboard_data = {
                    "user_id": assigned_to_id,
                    "tasks_completed": tasks_completed,
                    "xrp_earned": xrp_earned,
                    "rlusd_earned": rlusd_earned,
                    "eTask_earned": etask_earned,
                    "token_score": token_score,
                    "level": level,
                    "last_updated": firestore.SERVER_TIMESTAMP
                }
                
                leaderboard_ref.set(leaderboard_data, merge=True)
                updated_users.append(assigned_to_id)
                
            except Exception as user_error:
                print(f"Error updating leaderboard for user {assigned_to_id}: {user_error}")
                continue
        
        if updated_users:
            return f"Enhanced leaderboard updated for {len(updated_users)} users: {', '.join(updated_users)}"
        else:
            return "Failed to update leaderboard for any users"
        
    except Exception as e:
        print(f"Error updating enhanced leaderboard: {e}")
        return f"Failed to update enhanced leaderboard: {str(e)}"
