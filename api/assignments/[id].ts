import { NextApiRequest, NextApiResponse } from 'next';
import { getAssignmentById, updateAssignment, deleteAssignment } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Assignment ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const assignment = await getAssignmentById(id);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      res.status(200).json(assignment);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      res.status(500).json({ error: 'Failed to fetch assignment' });
    }
  } else if (req.method === 'PUT') {
    try {
      const assignment = await updateAssignment(id, req.body);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      res.status(200).json(assignment);
    } catch (error) {
      console.error('Error updating assignment:', error);
      res.status(500).json({ error: 'Failed to update assignment' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deleted = await deleteAssignment(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      res.status(500).json({ error: 'Failed to delete assignment' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
