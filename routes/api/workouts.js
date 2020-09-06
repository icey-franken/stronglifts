const express = require("express");
const asyncHandler = require("express-async-handler");

const {
  Workout,
  Exercise,
  Set,
  ExerciseName,
  WorkingWeight,
  WorkoutNote,
} = require("../../db/models");

const router = express.Router();

const grabWorkoutSpecs = {
  attributes: ["id", "workoutDate", "workoutComplete", "workoutSplit"],
  order: [
    [Exercise, "exerciseOrder", "asc"], //can probably remove these because of new defaults, but we'll leave it in for now
    [Exercise, Set, "setOrder", "asc"],
  ],
  include: [
    {
      model: Exercise,
      attributes: [
        "id",
        "workoutId",
        "exerciseOrder",
        "numSets",
        "numRepsGoal",
        "wasSuccessful",
        "numFails",
        "didDeload",
      ],
      include: [
        { model: ExerciseName, attributes: ["exerciseName"] },
        { model: WorkingWeight, attributes: ["weight"] },
        {
          model: Set,
          attributes: ["id", "setOrder", "numRepsActual"],
        },
      ],
    },
    { model: WorkoutNote, attributes: ["id", "description"] },
  ],
};

router.get(
  "/:userId",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const grabWorkoutSpecs = {
      where: { userId },
      attributes: ["id", "workoutDate", "workoutComplete", "workoutSplit"],
      limit: 10,
      order: [
        ["workoutDate", "desc"],
        [Exercise, "exerciseOrder", "asc"], //can probably remove these because of new defaults, but we'll leave it in for now
        [Exercise, Set, "setOrder", "asc"],
      ],
      include: [
        {
          model: Exercise,
          attributes: [
            "id",
            "workoutId",
            "exerciseOrder",
            "numSets",
            "numRepsGoal",
            "wasSuccessful",
            "numFails",
            "didDeload",
          ],
          include: [
            { model: ExerciseName, attributes: ["exerciseName"] },
            { model: WorkingWeight, attributes: ["weight"] },
            {
              model: Set,
              attributes: ["id", "setOrder", "numRepsActual"],
            },
          ],
        },
        { model: WorkoutNote, attributes: ["id", "description"] },
      ],
    };
    let workouts = await Workout.findAll(grabWorkoutSpecs);
    // console.log(workouts[1].WorkoutNote.description);
    // for(let i = 0; i < workouts.length; i ++) {
    // 	console.log('hits');
    // 	// workouts[i].WorkoutNote = null;
    // 	console.log(workouts[i].WorkoutNote);
    // 	// delete workouts[i].WorkoutNote.description;
    // 	//workouts[i].WorkoutNote.description);
    // };
    // // workouts.map((workout)=>{
    // // // 	const {workoutNote} = workout.WorkoutNote;
    // // workout.WorkoutNote = workout.WorkoutNote.description;
    // // return workout;
    // // })
    return res.json({ workouts });
  })
);

router.post(
  "/:userId",
  asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
		let wwValues = [null, null, null, null, null];
		console.log('line108',req.body===true);
		console.log(req.body.wwValues === true)
    if (req.body.wwValues) {
      wwValues = req.body.wwValues;

			let newWorkout = await Workout.create({
        workoutSplit: "A",
        userId,
      });

      let newNewWorkout = await Workout.create({
        workoutSplit: "B",
        userId,
      });
      let workoutId = newNewWorkout.id;
      const { id: squatId2 } = await Exercise.createNext(
        workoutId,
        null,
        1,
        null,
        wwValues[0] + 1
      );
      await Set.createBasicSets(squatId2, 5);
      const { id: benchId } = await Exercise.createNext(
        workoutId,
        null,
        4,
        null,
        wwValues[3]
      );
      await Set.createBasicSets(benchId, 5);
      const { id: rowId } = await Exercise.createNext(
        workoutId,
        null,
        5,
        null,
        wwValues[4]
      );
      await Set.createBasicSets(rowId, 5);
      console.log("hits", rowId);


      workoutId = newWorkout.id;
      const { id: squatId } = await Exercise.createNext(
        workoutId,
        null,
        1,
        null,
        wwValues[0]
      );
      await Set.createBasicSets(squatId, 5);

      const { id: overheadId } = await Exercise.createNext(
        workoutId,
        null,
        2,
        null,
        wwValues[1]
      );
      await Set.createBasicSets(overheadId, 5);
      const { id: deadliftId } = await Exercise.createNext(
        workoutId,
        null,
        3,
        null,
        wwValues[2]
      );
      await Set.createBasicSets(deadliftId, 1);

      // grabWorkoutSpecs.where = { id: workoutId };
      // newWorkout = await Workout.findOne(grabWorkoutSpecs);
      return res.json({ newWorkout });
    } else {
			let workoutId;
			console.log('hits line 179');
			console.log(wwValues);
      try {

        //first check that no incomplete workouts exist
        const incompleteId = await Workout.getIncompleteId(userId);
        if (incompleteId !== null) {
          workoutId = incompleteId;
        } else {
          const prevWorkout = await Workout.prevWorkout(userId);

          let prevId = null;
          let prevSplit = "B";
          if (prevWorkout !== null) {
            prevId = prevWorkout.id;
            prevSplit = prevWorkout.workoutSplit;
            prevWorkoutDate = prevWorkout.workoutDate;
          }

          let newWorkoutSplit = "A";
          if (prevSplit === "A") {
            newWorkoutSplit = "B";
          }

          const prevPrevWorkout = await Workout.prevPrevWorkout(
            userId,
            newWorkoutSplit
          );
          let prevPrevId = null;
          if (prevPrevWorkout !== null) {
            prevPrevId = prevPrevWorkout.id;
          }

          let newWorkout = await Workout.create({
            workoutSplit: newWorkoutSplit,
            userId,
          });
          workoutId = newWorkout.id;
          const workoutDate = newWorkout.workoutDate;

          const { id: squatId } = await Exercise.createNext(
            workoutId,
            prevId,
            1,
            workoutDate,
            wwValues[0]
          );
          await Set.createBasicSets(squatId, 5);
          if (newWorkoutSplit === "A") {
            const { id: overheadId } = await Exercise.createNext(
              workoutId,
              prevPrevId,
              2,
              workoutDate,
              wwValues[1]
            );
            await Set.createBasicSets(overheadId, 5);
            const { id: deadliftId } = await Exercise.createNext(
              workoutId,
              prevPrevId,
              3,
              workoutDate,
              wwValues[2]
            );
            await Set.createBasicSets(deadliftId, 1);
          } else if (newWorkoutSplit === "B") {
            const { id: benchId } = await Exercise.createNext(
              workoutId,
              prevPrevId,
              4,
              workoutDate,
              wwValues[3]
            );
            await Set.createBasicSets(benchId, 5);
            const { id: rowId } = await Exercise.createNext(
              workoutId,
              prevPrevId,
              5,
              workoutDate,
              wwValues[4]
            );
            await Set.createBasicSets(rowId, 5);
          }
        }
        grabWorkoutSpecs.where = { id: workoutId };
        newWorkout = await Workout.findOne(grabWorkoutSpecs);
        return res.json({ newWorkout });
      } catch (err) {
        console.log(err);
      }
    }
  })
);

router.put(
  "/:workoutId",
  asyncHandler(async (req, res) => {
    try {
      const { workoutComplete } = req.body;
      const id = parseInt(req.params.workoutId, 10);
      const workout = await Workout.update(
        { workoutComplete },
        { where: { id } }
      );
      return res.json({ workout });
    } catch (err) {
      console.log(err);
    }
  })
);

module.exports = router;
