import { NextApiRequest, NextApiResponse } from 'next';
import { deleteWorkDateRange } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Work range ID is required' });
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await deleteWorkDateRange(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Work date range not found' });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting work date range:', error);
      res.status(500).json({ error: 'Failed to delete work date range' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
