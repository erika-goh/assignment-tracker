import { sql } from '@vercel/postgres';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  start_date?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  subject: string;
  created_at: string;
  updated_at: string;
}

export interface WorkDateRange {
  id: string;
  assignment_id: string;
  start_date: string;
  end_date: string;
}

export async function createTables() {
  try {
    // Create assignments table
    await sql`
      CREATE TABLE IF NOT EXISTS assignments (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        due_date TIMESTAMP NOT NULL,
        start_date TIMESTAMP,
        completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        subject VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create work_date_ranges table
    await sql`
      CREATE TABLE IF NOT EXISTS work_date_ranges (
        id VARCHAR(255) PRIMARY KEY,
        assignment_id VARCHAR(255) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
      )
    `;

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

export async function getAllAssignments(): Promise<Assignment[]> {
  try {
    const { rows } = await sql<Assignment>`
      SELECT * FROM assignments 
      ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
}

export async function getAssignmentById(id: string): Promise<Assignment | null> {
  try {
    const { rows } = await sql<Assignment>`
      SELECT * FROM assignments WHERE id = ${id}
    `;
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching assignment:', error);
    throw error;
  }
}

export async function createAssignment(assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Promise<Assignment> {
  try {
    const id = Date.now().toString();
    const { rows } = await sql<Assignment>`
      INSERT INTO assignments (id, title, description, due_date, start_date, completed, priority, subject)
      VALUES (${id}, ${assignment.title}, ${assignment.description || null}, ${assignment.due_date}, ${assignment.start_date || null}, ${assignment.completed}, ${assignment.priority}, ${assignment.subject})
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
}

export async function updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment | null> {
  try {
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = $${Object.keys(updates).indexOf(key) + 1}`)
      .join(', ');

    if (!setClause) return null;

    const values = Object.values(updates).filter((_, index) => 
      Object.keys(updates)[index] !== 'id' && Object.keys(updates)[index] !== 'created_at'
    );

    const { rows } = await sql<Assignment>`
      UPDATE assignments 
      SET ${sql.unsafe(setClause)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] || null;
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
}

export async function deleteAssignment(id: string): Promise<boolean> {
  try {
    const { rowCount } = await sql`
      DELETE FROM assignments WHERE id = ${id}
    `;
    return rowCount > 0;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
}

export async function getWorkDateRanges(assignmentId: string): Promise<WorkDateRange[]> {
  try {
    const { rows } = await sql<WorkDateRange>`
      SELECT * FROM work_date_ranges WHERE assignment_id = ${assignmentId}
      ORDER BY start_date ASC
    `;
    return rows;
  } catch (error) {
    console.error('Error fetching work date ranges:', error);
    throw error;
  }
}

export async function createWorkDateRange(range: Omit<WorkDateRange, 'id'>): Promise<WorkDateRange> {
  try {
    const id = Date.now().toString();
    const { rows } = await sql<WorkDateRange>`
      INSERT INTO work_date_ranges (id, assignment_id, start_date, end_date)
      VALUES (${id}, ${range.assignment_id}, ${range.start_date}, ${range.end_date})
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    console.error('Error creating work date range:', error);
    throw error;
  }
}

export async function deleteWorkDateRange(id: string): Promise<boolean> {
  try {
    const { rowCount } = await sql`
      DELETE FROM work_date_ranges WHERE id = ${id}
    `;
    return rowCount > 0;
  } catch (error) {
    console.error('Error deleting work date range:', error);
    throw error;
  }
}
