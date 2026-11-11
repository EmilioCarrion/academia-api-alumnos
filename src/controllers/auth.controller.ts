import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';

export const authController = {
  register: async (req: Request, res: Response) => {
    res.status(201).json(await authService.register(req.body));
  },
  login: async (req: Request, res: Response) => {
    res.status(200).json(await authService.login(req.body));
  },
};
