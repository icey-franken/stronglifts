import Cookies from "js-cookie"; //this module allows us to grab cookies

//action types
import { GET_WORKOUTS, CREATE_WORKOUT } from "./workouts";
import { SET_USER, REMOVE_USER } from "./auth";
import {DELETE_WORKOUT} from './workouts';

export const UPDATE_SUCCESS = 'exercise/UPDATE_SUCCESS';

export const updateExerciseSuccess= (exerciseId, wasSuccessful) =>({
	type: UPDATE_SUCCESS,
	exerciseId,
	wasSuccessful
})

export const updateExerciseSuccessThunk = (exerciseId, wasSuccessful) => {
	return async (dispatch) => {
		try{
			const body = JSON.stringify({wasSuccessful});
			const res = await fetch(`api/exercises/${exerciseId}`, {
				method: "put",
        headers: {
          "Content-Type": "application/json",
          "XSRF-TOKEN": Cookies.get("XSRF-TOKEN"),
        },
        body,
			});
			if(!res.ok) throw res;
			dispatch(updateExerciseSuccess(exerciseId, wasSuccessful));
			return res;
		} catch(err) {console.log(err)}
	}
}

export default function exerciseReducer(state = {}, action) {
  Object.freeze(state);
  let newState = Object.assign({}, state);
  switch (action.type) {
    case SET_USER:
      const exerciseIds = Object.keys(newState);
      const userId = action.user.id;
      console.log(userId);
      exerciseIds.forEach((exerciseId) => {
        newState[exerciseId].userId = userId;
      });
      return newState;
    case REMOVE_USER:
      const exerciseIds2 = Object.keys(newState);

      exerciseIds2.forEach((exerciseId) => {
        delete newState[exerciseId].userId;
      });
      return newState;
    case GET_WORKOUTS:
      const exerciseIds3 = Object.keys(action.exercises);
      action.sets = {};
      exerciseIds3.forEach((id) => {
        newState[id] = { id };
        const exercise = action.exercises[id];
        newState[id].exerciseName = exercise.ExerciseName.exerciseName;
        newState[id].workingWeight = exercise.WorkingWeight.weight;
        let relevantExerciseKeys = [
          "exerciseOrder",
          "id",
          "numRepsGoal",
          "numSets",
          "setIds",
					"workoutId",
					'wasSuccessful',
					'numFails',
					'didDeload'
        ];
        relevantExerciseKeys.forEach((relevantExerciseKey) => {
          newState[id][relevantExerciseKey] = exercise[relevantExerciseKey];
        });
        const sets = exercise.Sets;
        sets.forEach((set) => {
          set.exerciseId = parseInt(id, 10);
          set.workoutId = exercise.workoutId;
          const setCopy = Object.assign({}, set);
          action.sets[set.id] = setCopy;
        });
      });
      delete action.exercises;
      return newState;
    case CREATE_WORKOUT:
      if (action.workout === "duplicate") {
        return newState;
      }
      const exerciseIds4 = Object.keys(action.exercises);
      action.sets = {};
      exerciseIds4.forEach((id) => {
        newState[id] = { id };
        const exercise = action.exercises[id];
        newState[id].exerciseName = exercise.ExerciseName.exerciseName;
        newState[id].workingWeight = exercise.WorkingWeight.weight;
        let relevantExerciseKeys = [
          "exerciseOrder",
          "id",
          "numRepsGoal",
          "numSets",
          "setIds",
					"workoutId",
					'wasSuccessful',
					'numFails',
					'didDeload'
        ];
        relevantExerciseKeys.forEach((relevantExerciseKey) => {
          newState[id][relevantExerciseKey] = exercise[relevantExerciseKey];
        });
        const sets = exercise.Sets;
        sets.forEach((set) => {
          set.exerciseId = parseInt(id, 10);
          set.workoutId = exercise.workoutId;
          const setCopy = Object.assign({}, set);
          action.sets[set.id] = setCopy;
        });
      });
      delete action.exercises;
			return newState;
		case UPDATE_SUCCESS:
			newState[action.exerciseId].wasSuccessful = action.wasSuccessful;
			return newState;
		case DELETE_WORKOUT:
			const exerciseIds5 = action.exerciseIds;
			exerciseIds5.forEach(id=>{
				delete newState[id]
			})
			return newState;
    default:
      return state;
  }
}
