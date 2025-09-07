import { NextApiRequest, NextApiResponse } from 'next';
import { getWorkDateRanges, createWorkDateRange } from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Assignment ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const workRanges = await getWorkDateRanges(id);
      res.status(200).json(workRanges);
    } catch (error) {
      console.error('Error fetching work date ranges:', error);
      res.status(500).json({ error: 'Failed to fetch work date ranges' });
    }
  } else if (req.method === 'POST') {
    try {
      const workRange = await createWorkDateRange({
        assignment_id: id,
        start_date: req.body.startDate,
        end_date: req.body.endDate
      });
      res.status(201).json(workRange);
    } catch (error) {
      console.error('Error creating work date range:', error);
      res.status(500).json({ error: 'Failed to create work date range' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
