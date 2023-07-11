// Event for submitting the form
import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';

class TaskFormSubmitted extends Equatable {
  final String taskTitle;
  final String taskDescription;
  final String projectName;
  final bool requiresAttachments;
  final String termsBlob;
  final double rewardAmount;
  final String rewardCurrency;
  final String paymentMethod;

  const TaskFormSubmitted({
    required this.taskTitle,
    required this.taskDescription,
    required this.projectName,
    required this.requiresAttachments,
    required this.termsBlob,
    required this.rewardAmount,
    required this.rewardCurrency,
    required this.paymentMethod,
  });

  @override
  List<Object?> get props => [
        taskTitle,
        taskDescription,
        projectName,
        requiresAttachments,
        termsBlob,
        rewardAmount,
        rewardCurrency,
        paymentMethod,
      ];
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

// Bloc for managing the form state and data
class TaskFormBloc extends Bloc<TaskFormSubmitted, TaskFormState> {
  TaskFormBloc() : super(TaskFormInitial());

  @override
  Stream<TaskFormState> mapEventToState(TaskFormSubmitted event) async* {
    if (event is TaskFormSubmitted) {
      yield TaskFormSubmitting();

      try {
        // Process the form data or make an API call here
        await Future.delayed(Duration(seconds: 2)); // Simulating API call

        yield TaskFormSubmittedSuccess();
      } catch (e) {
        yield TaskFormSubmittedFailure(e.toString());
      }
    }
  }
}