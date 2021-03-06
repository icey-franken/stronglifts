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

router.put(
  "/:setId",
  asyncHandler(async (req, res) => {
    try {
      const {numRepsActual} = req.body;
      const id = parseInt(req.params.setId, 10);
      // const set = await Set.findOne({where: id});
      const set = await Set.update({ numRepsActual }, { where: { id } });
			return res.json({ set });

			// return (res.json(id));
      // await Set.update({where:{id: setId}})
    } catch (err) {
      // console.log(err);
    }
  })
);

module.exports = router;
