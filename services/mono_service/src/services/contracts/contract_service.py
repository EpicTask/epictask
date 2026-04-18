# import os
# from google import genai
# from ...config.secrets import get_secret
# from ...domain.task_models import TaskCreated

# class ContractService:
#     """Service for generating contracts using AI."""

#     def __init__(self):
#         self.gemini_key = get_secret("google_ai_api_key") or os.getenv("GOOGLE_AI_API_KEY")
#         if self.gemini_key:
#             self.client = genai.Client(api_key=self.gemini_key)
#         else:
#             print("Warning: Google AI API key not found.")
#             self.client = None

#     async def generate_contract(self, task_data: TaskCreated, user_id: str) -> str:
#         """
#         Generate a contract based on task data.
#         """
#         if not self.client:
#             return "Error: AI service not configured."

#         task_creator_name = f"User ID: {user_id}"
#         # Assuming assigned_to_ids is populated, take the first one
#         assignee_id = task_data.assigned_to_ids[0] if task_data.assigned_to_ids else "Pending"
#         task_assignee_name = f"User ID: {assignee_id}"

#         prompt = (
#             f"Generate a contract between Task Creator {task_creator_name} (ID: {user_id}) "
#             f"and Task Assignee {task_assignee_name} (ID: {assignee_id}). "
#             "This contract is not bonded by any law other than subject to EpicTask Policy. "
#             "Use the following TaskCreated data:\n\n"
#             f"Task Title: {task_data.task_title}\n"
#             f"Task Description: {task_data.task_description}\n"
#             f"Task ID: {task_data.task_id}\n"
#             f"Project ID: {task_data.project_id}\n"
#             f"Project Name: {task_data.project_name}\n"
#             f"Reward Amount: {task_data.reward_amount} {task_data.reward_currency}\n"
#             f"Payment Method: {task_data.payment_method}\n\n"
#             f"User provided terms and conditions: {task_data.terms_blob}\n\n"
#             "Contract :"
#         )

#         try:
#             response = self.client.models.generate_content(
#                 model='gemini-3.1-pro-preview',
#                 contents=prompt,
#                 config=genai.types.GenerateContentConfig(
#                     system_instruction="You are a legal assistant capable of drafting simple agreements for task management.",
#                     max_output_tokens=500,
#                     temperature=0.5
#                 )
#             )
#             return response.text.strip()
#         except Exception as e:
#             print(f"Error generating contract: {e}")
#             return "Error generating contract."

# contract_service = ContractService()
