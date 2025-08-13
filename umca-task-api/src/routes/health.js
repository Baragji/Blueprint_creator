import express from 'express';
import { successResponse, sendResponse } from '../utils/responses.js';

const router = express.Router();

router.get('/', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'connected' // Mock database status for demo
  };

  const response = successResponse(healthData);
  return sendResponse(res, response);
});

export default router;