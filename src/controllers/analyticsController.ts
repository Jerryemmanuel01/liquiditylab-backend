import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const data = await AnalyticsService.getDashboardAnalytics(userId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

export const getOverviewDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const data = await AnalyticsService.getOverviewDashboard(userId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching overview dashboard:', error);
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};
