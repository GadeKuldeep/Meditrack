import Medication from '../models/Medication.js';

// @desc    Get all medications for a user
// @route   GET /api/medications
// @access  Private
export const getMedications = async (req, res, next) => {
  try {
    const meds = await Medication.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(meds);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new medication
// @route   POST /api/medications
// @access  Private
export const createMedication = async (req, res, next) => {
  try {
    const { name, dosage, unit, frequency, schedule, startDate, endDate, category, notes } = req.body;

    const medication = new Medication({
      userId: req.user._id,
      name,
      dosage,
      unit,
      frequency,
      schedule,
      startDate,
      endDate,
      category,
      notes,
    });

    const createdMedication = await medication.save();
    res.status(201).json(createdMedication);
  } catch (error) {
    next(error);
  }
};

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private
export const updateMedication = async (req, res, next) => {
  try {
    const { name, dosage, unit, frequency, schedule, startDate, endDate, category, isActive, notes } = req.body;

    const medication = await Medication.findById(req.params.id);

    if (medication) {
      if (medication.userId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to edit this medication');
      }

      medication.name = name !== undefined ? name : medication.name;
      medication.dosage = dosage !== undefined ? dosage : medication.dosage;
      medication.unit = unit !== undefined ? unit : medication.unit;
      medication.frequency = frequency !== undefined ? frequency : medication.frequency;
      medication.schedule = schedule !== undefined ? schedule : medication.schedule;
      medication.startDate = startDate !== undefined ? startDate : medication.startDate;
      medication.endDate = endDate !== undefined ? endDate : medication.endDate;
      medication.category = category !== undefined ? category : medication.category;
      medication.isActive = isActive !== undefined ? isActive : medication.isActive;
      medication.notes = notes !== undefined ? notes : medication.notes;

      const updatedMedication = await medication.save();
      res.json(updatedMedication);
    } else {
      res.status(404);
      throw new Error('Medication not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private
export const deleteMedication = async (req, res, next) => {
  try {
    const medication = await Medication.findById(req.params.id);

    if (medication) {
      if (medication.userId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this medication');
      }

      await Medication.deleteOne({ _id: req.params.id });
      res.json({ message: 'Medication removed' });
    } else {
      res.status(404);
      throw new Error('Medication not found');
    }
  } catch (error) {
    next(error);
  }
};
