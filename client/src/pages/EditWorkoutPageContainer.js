import React from "react";
import { useDispatch } from "react-redux";
import { workoutThunks } from "../store/workouts";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import WorkoutPage from "./WorkoutPage";

export default function EditWorkoutPageContainer() {
	const { workoutId } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(workoutThunks.updateWorkoutComplete(workoutId, false));
  }, [dispatch, workoutId]);

  return <WorkoutPage workoutId={workoutId} />;
}
