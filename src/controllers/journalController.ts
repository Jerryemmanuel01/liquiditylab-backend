import { Request, Response } from 'express';
import { Journal } from '../models/journal';

export const getJournals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { category, search } = req.query;

    let query: any = { user: userId };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Populate linkedTrades to easily display them on the frontend
    const journals = await Journal.find(query)
      .populate({
        path: 'linkedTrades',
        select: 'asset direction entryPrice executionTime',
        populate: {
          path: 'asset',
          select: 'symbol'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: journals
    });
  } catch (error: any) {
    console.error('Error fetching journals:', error);
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

export const getJournalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const journal = await Journal.findOne({ _id: req.params.id, user: userId })
      .populate({
        path: 'linkedTrades',
        select: 'asset direction entryPrice executionTime',
        populate: {
          path: 'asset',
          select: 'symbol'
        }
      });

    if (!journal) {
      res.status(404).json({ success: false, error: 'Journal entry not found' });
      return;
    }

    res.status(200).json({ success: true, data: journal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

export const createJournal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const journalData = { ...req.body, user: userId };

    const journal = await Journal.create(journalData);

    // Fetch the populated version
    const populatedJournal = await Journal.findById(journal._id).populate({
      path: 'linkedTrades',
      select: 'asset direction entryPrice executionTime',
      populate: {
        path: 'asset',
        select: 'symbol'
      }
    });

    res.status(201).json({ success: true, data: populatedJournal });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Invalid Data' });
  }
};

export const updateJournal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const journal = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true, runValidators: true }
    ).populate({
      path: 'linkedTrades',
      select: 'asset direction entryPrice executionTime',
      populate: {
        path: 'asset',
        select: 'symbol'
      }
    });

    if (!journal) {
      res.status(404).json({ success: false, error: 'Journal entry not found' });
      return;
    }

    res.status(200).json({ success: true, data: journal });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Invalid Data' });
  }
};

export const deleteJournal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const journal = await Journal.findOneAndDelete({ _id: req.params.id, user: userId });

    if (!journal) {
      res.status(404).json({ success: false, error: 'Journal entry not found' });
      return;
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};
