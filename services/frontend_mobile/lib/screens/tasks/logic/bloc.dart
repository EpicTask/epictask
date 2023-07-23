// Event for submitting the form

import 'package:bloc/bloc.dart';
import 'package:epictask/models/task_event_model/task_event.dart';
import 'package:epictask/models/task_model/task_model.dart';
import 'package:epictask/services/functions/firebase_functions.dart';
import 'package:equatable/equatable.dart';

class TaskFormSubmitted extends Equatable {
  final TaskModel task;

  const TaskFormSubmitted({required this.task});

  @override
  List<Object?> get props => [task];
}

// State for the form
abstract class TaskFormState extends Equatable {
  const TaskFormState();

  @override
  List<Object?> get props => [];
}

class TaskFormInitial extends TaskFormState {}

class TaskFormSubmitting extends TaskFormState {}

class TaskFormSubmittedSuccess extends TaskFormState {}

class TaskFormSubmittedFailure extends TaskFormState {
  final String error;

  const TaskFormSubmittedFailure(this.error);

  @override
  List<Object?> get props => [error];
}

// Bloc for managing the create task form state and data
class TaskFormBloc extends Bloc<TaskFormSubmitted, TaskFormState> {
  TaskFormBloc() : super(TaskFormInitial()) {
    on<TaskFormSubmitted>(
        (TaskFormSubmitted event, Emitter<TaskFormState> emit) async {
      try {
        final TaskEvent taskEvent = TaskEvent.defaultEvent().copyWith(
            additional_data: event.task.toJson(),
            event_type: 'TaskCreated',
            user_id: currentUserID);
        FirestoreDatabase().writeTaskEvent(taskEvent);
        emit(TaskFormSubmittedSuccess());
      } catch (e) {
        emit(TaskFormSubmittedFailure(e.toString()));
      }
    });
  }
}
