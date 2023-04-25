from flask import Flask, render_template, request, redirect

app = Flask(__name__, template_folder='templates')

# Sample task data
tasks = [
    {
        "id": 1,
        "title": "Clean the kitchen",
        "description": "Wash dishes, wipe down counters, sweep the floor",
        "deadline": "2023-05-01",
        "reward": 10.0,
        "status": "Pending"
    },
    {
        "id": 2,
        "title": "Do laundry",
        "description": "Wash and fold clothes",
        "deadline": "2023-05-02",
        "reward": 5.0,
        "status": "Pending"
    },
    {
        "id": 3,
        "title": "Mow the lawn",
        "description": "Mow the front and back lawns, trim the edges",
        "deadline": "2023-05-03",
        "reward": 15.0,
        "status": "Pending"
    },
    {
        "id": 4,
        "title": "Buy groceries",
        "description": "Buy groceries for the week",
        "deadline": "2023-05-04",
        "reward": 20.0,
        "status": "Pending"
    },
    {
        "id": 5,
        "title": "Clean the bathroom",
        "description": "Clean the sink, toilet, and shower",
        "deadline": "2023-05-05",
        "reward": 10.0,
        "status": "Pending"
    },
    {
        "id": 6,
        "title": "Walk the dog",
        "description": "Take the dog for a walk",
        "deadline": "2023-05-06",
        "reward": 5.0,
        "status": "Pending"
    },
    {
        "id": 7,
        "title": "Do the dishes",
        "description": "Wash and put away dishes",
        "deadline": "2023-05-07",
        "reward": 5.0,
        "status": "Pending"
    },
    {
        "id": 8,
        "title": "Vacuum the living room",
        "description": "Vacuum the living room",
        "deadline": "2023-05-08",
        "reward": 10.0,
        "status": "Pending"
    },
    {
        "id": 9,
        "title": "Organize closet",
        "description": "Organize clothes in closet",
        "deadline": "2023-05-09",
        "reward": 5.0,
        "status": "Pending"
    },
    {
        "id": 10,
        "title": "Water plants",
        "description": "Water indoor and outdoor plants",
        "deadline": "2023-05-10",
        "reward": 5.0,
        "status": "Pending"
    }

]


@app.route('/')
def home():
    return render_template('index.html', tasks=tasks)


@app.route('/tasks/<int:task_id>')
def task_details(task_id):
    task = [t for t in tasks if t['id'] == task_id][0]
    return render_template('task_detail.html', task=task)


@app.route('/tasks', methods=['GET', 'POST'])
def create_task():
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        task_id = len(tasks) + 1
        task = {
            'id': task_id,
            'title': title,
            'description': description,
            'status': 'Open'
        }
        tasks.append(task)
        return redirect('/')
    return render_template('create_task.html')


if __name__ == '__main__':
    app.run()

# Build Docker Image
# taskcoin % docker build -t rnolden3/taskcoin:1.0 . 
# Run Docker Container
# docker run -p 8080:8080 rnolden3/taskcoin:1.0