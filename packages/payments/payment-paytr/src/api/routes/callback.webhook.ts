import { Request, Response } from 'express';

export default async (req: Request, res: Response): Promise<void> => {
    try {
        console.log(req.body);
        res.json();
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
