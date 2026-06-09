import { Request, Response, NextFunction } from 'express';
import { AssetService } from '../services/assetService';
import { asyncHandler } from '../utils/asyncHandler';

export const createAsset = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const asset = await AssetService.createAsset(req.user!.id, req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      asset
    }
  });
});

export const getAssets = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const assets = await AssetService.getAssets(req.user!.id);
  
  res.status(200).json({
    status: 'success',
    results: assets.length,
    data: {
      assets
    }
  });
});

export const updateAsset = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const asset = await AssetService.updateAsset(req.user!.id, req.params.id, req.body);
  
  if (!asset) {
    return res.status(404).json({
      status: 'fail',
      message: 'Asset not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      asset
    }
  });
});

export const deleteAsset = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const success = await AssetService.deleteAsset(req.user!.id, req.params.id);
  
  if (!success) {
    return res.status(404).json({
      status: 'fail',
      message: 'Asset not found'
    });
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
