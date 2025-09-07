import { NextApiRequest, NextApiResponse } from 'next';
import { createTables, getAllAssignments, createAssignment } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Initialize tables on first request
  await createTables();

  if (req.method === 'GET') {
    try {
      const assignments = await getAllAssignments();
      res.status(200).json(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  } else if (req.method === 'POST') {
    try {
      const assignment = await createAssignment(req.body);
      res.status(201).json(assignment);
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
