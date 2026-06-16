import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

// TypeScript Interfaces
export interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  createdDate: string;
}

export interface Task {
  id: string;
  title: string;
  desc: string;
  status: 'todo' | 'progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  leadId: string; // Linked lead ID
  dueDate: string;
}

export interface ActivityLog {
  id: string;
  text: string;
  time: string;
  type: 'lead' | 'task' | 'deal';
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  value: number;
  createdDate: string;
}

export interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CrmContextType {
  leads: Lead[];
  contacts: Contact[];
  tasks: Task[];
  activities: ActivityLog[];
  theme: 'light' | 'dark';
  toast: ToastInfo | null;
  addLead: (lead: Omit<Lead, 'id' | 'createdDate'>) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
  clearActivities: () => Promise<void>;
  toggleTheme: () => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  logActivity: (text: string, type?: 'lead' | 'task' | 'deal') => Promise<void>;
}

// Initial demo datasets
const demoLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Sarah Connor',
    company: 'Cyberdyne Systems',
    value: 85000,
    email: 'sconnor@cyberdyne.co',
    phone: '+1 (555) 901-2834',
    status: 'proposal',
    priority: 'high',
    createdDate: '2026-05-12'
  },
  {
    id: 'lead-2',
    name: 'Bruce Wayne',
    company: 'Wayne Enterprises',
    value: 150000,
    email: 'bruce@waynecorp.com',
    phone: '+1 (555) 100-1939',
    status: 'won',
    priority: 'high',
    createdDate: '2026-04-18'
  },
  {
    id: 'lead-3',
    name: 'Clark Kent',
    company: 'Daily Planet',
    value: 12000,
    email: 'ckent@dailyplanet.org',
    phone: '+1 (555) 234-9876',
    status: 'new',
    priority: 'low',
    createdDate: '2026-06-02'
  },
  {
    id: 'lead-4',
    name: 'Tony Stark',
    company: 'Stark Industries',
    value: 250000,
    email: 'tony@stark.com',
    phone: '+1 (555) 300-3000',
    status: 'won',
    priority: 'high',
    createdDate: '2026-03-25'
  },
  {
    id: 'lead-5',
    name: 'Peter Parker',
    company: 'Daily Bugle',
    value: 4500,
    email: 'pparker@dailybugle.com',
    phone: '+1 (555) 987-6543',
    status: 'contacted',
    priority: 'low',
    createdDate: '2026-06-10'
  },
  {
    id: 'lead-6',
    name: 'Diana Prince',
    company: 'The Louvre Museum',
    value: 45050,
    email: 'diana@louvre.fr',
    phone: '+33 (1) 4020-5317',
    status: 'qualified',
    priority: 'medium',
    createdDate: '2026-05-30'
  },
  {
    id: 'lead-7',
    name: 'Barry Allen',
    company: 'Central City Lab',
    value: 18000,
    email: 'ballen@centralcitypd.gov',
    phone: '+1 (555) 555-1212',
    status: 'lost',
    priority: 'medium',
    createdDate: '2026-04-05'
  }
];

const demoTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Review Cyberdyne tech specs',
    desc: 'Review integration specs with the Engineering Lead before finalizing proposal.',
    status: 'review',
    priority: 'high',
    leadId: 'lead-1',
    dueDate: '2026-06-20'
  },
  {
    id: 'task-2',
    title: 'Stark Industries onboarding',
    desc: 'Set up credentials and kick-off meeting for standard SaaS setup.',
    status: 'progress',
    priority: 'high',
    leadId: 'lead-4',
    dueDate: '2026-06-18'
  },
  {
    id: 'task-3',
    title: 'Wayne Enterprises signature request',
    desc: 'Send Docusign link for executive approval on pricing agreement.',
    status: 'done',
    priority: 'medium',
    leadId: 'lead-2',
    dueDate: '2026-06-01'
  },
  {
    id: 'task-4',
    title: 'Callback to Peter Parker',
    desc: 'Follow up on freelancer pricing tier availability.',
    status: 'todo',
    priority: 'low',
    leadId: 'lead-5',
    dueDate: '2026-06-25'
  },
  {
    id: 'task-5',
    title: 'Prepare presentation deck',
    desc: 'Assemble slides for the quarterly sales target meeting.',
    status: 'todo',
    priority: 'medium',
    leadId: '',
    dueDate: '2026-06-28'
  }
];

const demoActivities: ActivityLog[] = [
  { id: 'act-1', text: 'Stark Industries deal closed successfully', time: '2 hours ago', type: 'deal' },
  { id: 'act-2', text: 'Sarah Connor moved to Proposal stage', time: '1 day ago', type: 'lead' },
  { id: 'act-3', text: 'Task "Wayne Enterprises signature request" completed', time: '2 days ago', type: 'task' },
  { id: 'act-4', text: 'Barry Allen deal marked as Closed Lost', time: '3 days ago', type: 'lead' }
];

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // 1. Utility toast dispatcher (wrapped in useCallback and declared before effects)
  const triggerToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  // 2. Log activity callback (declared before effects)
  const logActivity = useCallback(async (text: string, type: 'lead' | 'task' | 'deal' = 'lead') => {
    if (!user) return;

    const newAct = {
      id: 'act-' + Date.now(),
      text,
      time: 'Just now',
      type,
      user_id: user.id
    };

    const { error } = await supabase.from('activities').insert([newAct]);
    if (error) {
      console.error('Supabase log activity error:', error.message);
      return;
    }

    setActivities(prev => {
      const updated = [
        { id: newAct.id, text: newAct.text, time: newAct.time, type: newAct.type },
        ...prev
      ];
      if (updated.length > 20) updated.pop();
      return updated;
    });
  }, [user]);

  // 3. Seed default demo data inside Supabase tables (wrapped in useCallback and declared before effects)
  const seedDemoData = useCallback(async (userId: string) => {
    try {
      // Create leads
      const leadsToInsert = demoLeads.map(l => ({
        id: l.id,
        name: l.name,
        company: l.company,
        value: l.value,
        email: l.email,
        phone: l.phone,
        status: l.status,
        priority: l.priority,
        created_date: l.createdDate,
        user_id: userId
      }));

      const { error: leadsInsertErr } = await supabase.from('leads').insert(leadsToInsert);
      if (leadsInsertErr) throw leadsInsertErr;

      // Create tasks
      const tasksToInsert = demoTasks.map(t => ({
        id: t.id,
        title: t.title,
        desc_content: t.desc,
        status: t.status,
        priority: t.priority,
        lead_id: t.leadId || null,
        due_date: t.dueDate,
        user_id: userId
      }));

      const { error: tasksInsertErr } = await supabase.from('tasks').insert(tasksToInsert);
      if (tasksInsertErr) throw tasksInsertErr;

      // Create activities
      const activitiesToInsert = demoActivities.map(a => ({
        id: a.id,
        text: a.text,
        time: a.time,
        type: a.type,
        user_id: userId
      }));

      const { error: activitiesInsertErr } = await supabase.from('activities').insert(activitiesToInsert);
      if (activitiesInsertErr) throw activitiesInsertErr;

      // Update state locally
      setLeads(demoLeads);
      setTasks(demoTasks);
      setActivities(demoActivities);

    } catch (err) {
      console.error('Error seeding demo data:', err);
      triggerToast('Error pre-populating sandbox database.', 'error');
    }
  }, [triggerToast]);

  // 4. Derive contacts dynamically from won deals instead of syncing in useEffect
  const contacts: Contact[] = React.useMemo(() => {
    return leads
      .filter(l => l.status === 'won')
      .map(l => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        company: l.company,
        value: l.value,
        createdDate: l.createdDate
      }));
  }, [leads]);

  // Theme loader (keeps theme in local storage since it is UI preferences only)
  useEffect(() => {
    const storedTheme = localStorage.getItem('apex_react_theme') as 'light' | 'dark';
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute('data-theme', storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Fetch all user specific data from Supabase
  useEffect(() => {
    if (!user) {
      setLeads([]);
      setTasks([]);
      setActivities([]);
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch leads
        const { data: dbLeads, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id);

        if (leadsError) throw leadsError;

        // If no leads exist, automatically seed demo data for the first launch
        if (!dbLeads || dbLeads.length === 0) {
          await seedDemoData(user.id);
          return;
        }

        const formattedLeads = dbLeads.map((item) => ({
          id: item.id,
          name: item.name,
          company: item.company,
          value: Number(item.value),
          email: item.email || '',
          phone: item.phone || '',
          status: item.status,
          priority: item.priority,
          createdDate: item.created_date
        }));
        setLeads(formattedLeads);

        // 2. Fetch tasks
        const { data: dbTasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        if (tasksError) throw tasksError;

        const formattedTasks = (dbTasks || []).map((item) => ({
          id: item.id,
          title: item.title,
          desc: item.desc_content || '',
          status: item.status,
          priority: item.priority,
          leadId: item.lead_id || '',
          dueDate: item.due_date
        }));
        setTasks(formattedTasks);

        // 3. Fetch activities
        const { data: dbActivities, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('id', { ascending: false });

        if (activitiesError) throw activitiesError;

        const formattedActivities = (dbActivities || []).map((item) => ({
          id: item.id,
          text: item.text,
          time: item.time,
          type: item.type
        }));
        setActivities(formattedActivities);

      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
        triggerToast('Error loading details from Supabase.', 'error');
      }
    };

    fetchData();
  }, [user, seedDemoData, triggerToast]);

  // Lead CRUD
  const addLead = async (newLeadData: Omit<Lead, 'id' | 'createdDate'>) => {
    if (!user) return;

    const newId = 'lead-' + Date.now();
    const createdDate = new Date().toISOString().split('T')[0];

    const dbLead = {
      id: newId,
      name: newLeadData.name,
      company: newLeadData.company,
      value: newLeadData.value,
      email: newLeadData.email,
      phone: newLeadData.phone,
      status: newLeadData.status,
      priority: newLeadData.priority,
      created_date: createdDate,
      user_id: user.id
    };

    const { error } = await supabase.from('leads').insert([dbLead]);
    if (error) {
      console.error('Supabase addLead error:', error.message);
      triggerToast('Error creating lead.', 'error');
      return;
    }

    const stateLead: Lead = {
      ...newLeadData,
      id: newId,
      createdDate
    };
    setLeads(prev => [...prev, stateLead]);
    await logActivity(`Created Lead: ${stateLead.name} (${stateLead.company})`, 'lead');
    triggerToast('Lead created successfully.', 'success');
  };

  const updateLead = async (id: string, updatedFields: Partial<Lead>) => {
    if (!user) return;

    const dbFields: Record<string, string | number> = {};
    if (updatedFields.name !== undefined) dbFields.name = updatedFields.name;
    if (updatedFields.company !== undefined) dbFields.company = updatedFields.company;
    if (updatedFields.value !== undefined) dbFields.value = updatedFields.value;
    if (updatedFields.email !== undefined) dbFields.email = updatedFields.email;
    if (updatedFields.phone !== undefined) dbFields.phone = updatedFields.phone;
    if (updatedFields.status !== undefined) dbFields.status = updatedFields.status;
    if (updatedFields.priority !== undefined) dbFields.priority = updatedFields.priority;

    const { error } = await supabase
      .from('leads')
      .update(dbFields)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Supabase updateLead error:', error.message);
      triggerToast('Error updating lead.', 'error');
      return;
    }

    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        const merged = { ...l, ...updatedFields };
        if (updatedFields.status && updatedFields.status !== l.status) {
          logActivity(`${l.name} (${l.company}) status updated to ${updatedFields.status.toUpperCase()}`, 'lead');
        } else {
          logActivity(`Lead ${l.name} details updated`, 'lead');
        }
        return merged;
      }
      return l;
    }));
    triggerToast('Lead updated.', 'success');
  };

  const deleteLead = async (id: string) => {
    if (!user) return;

    const target = leads.find(l => l.id === id);
    if (!target) return;

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Supabase deleteLead error:', error.message);
      triggerToast('Error deleting lead.', 'error');
      return;
    }

    // Unlink any tasks on Supabase
    await supabase
      .from('tasks')
      .update({ lead_id: null })
      .eq('lead_id', id)
      .eq('user_id', user.id);

    setLeads(prev => prev.filter(l => l.id !== id));
    setTasks(prev => prev.map(t => t.leadId === id ? { ...t, leadId: '' } : t));
    await logActivity(`Deleted Lead: ${target.name}`, 'lead');
    triggerToast('Lead deleted.', 'info');
  };

  // Task CRUD
  const addTask = async (newTaskData: Omit<Task, 'id'>) => {
    if (!user) return;

    const newId = 'task-' + Date.now();
    const dbTask = {
      id: newId,
      title: newTaskData.title,
      desc_content: newTaskData.desc,
      status: newTaskData.status,
      priority: newTaskData.priority,
      lead_id: newTaskData.leadId || null,
      due_date: newTaskData.dueDate,
      user_id: user.id
    };

    const { error } = await supabase.from('tasks').insert([dbTask]);
    if (error) {
      console.error('Supabase addTask error:', error.message);
      triggerToast('Error creating task.', 'error');
      return;
    }

    const newTask: Task = {
      ...newTaskData,
      id: newId
    };
    setTasks(prev => [...prev, newTask]);
    await logActivity(`Created Task: "${newTask.title}"`, 'task');
    triggerToast('Task created successfully.', 'success');
  };

  const updateTask = async (id: string, updatedFields: Partial<Task>) => {
    if (!user) return;

    const dbFields: Record<string, string | number | null> = {};
    if (updatedFields.title !== undefined) dbFields.title = updatedFields.title;
    if (updatedFields.desc !== undefined) dbFields.desc_content = updatedFields.desc;
    if (updatedFields.status !== undefined) dbFields.status = updatedFields.status;
    if (updatedFields.priority !== undefined) dbFields.priority = updatedFields.priority;
    if (updatedFields.leadId !== undefined) dbFields.lead_id = updatedFields.leadId || null;
    if (updatedFields.dueDate !== undefined) dbFields.due_date = updatedFields.dueDate;

    const { error } = await supabase
      .from('tasks')
      .update(dbFields)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Supabase updateTask error:', error.message);
      triggerToast('Error updating task.', 'error');
      return;
    }

    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const merged = { ...t, ...updatedFields };
        if (updatedFields.status && updatedFields.status !== t.status) {
          logActivity(`Task "${t.title}" moved to ${updatedFields.status.toUpperCase()}`, 'task');
        } else {
          logActivity(`Task "${t.title}" details updated`, 'task');
        }
        return merged;
      }
      return t;
    }));
    triggerToast('Task updated.', 'success');
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    const target = tasks.find(t => t.id === id);
    if (!target) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Supabase deleteTask error:', error.message);
      triggerToast('Error deleting task.', 'error');
      return;
    }

    setTasks(prev => prev.filter(t => t.id !== id));
    await logActivity(`Deleted Task: "${target.title}"`, 'task');
    triggerToast('Task deleted.', 'info');
  };

  // DB Resets
  const resetDatabase = async () => {
    if (!user) return;

    try {
      // Clear user data
      await supabase.from('leads').delete().eq('user_id', user.id);
      await supabase.from('tasks').delete().eq('user_id', user.id);
      await supabase.from('activities').delete().eq('user_id', user.id);

      // Re-seed default
      await seedDemoData(user.id);
      triggerToast('Sandbox database reset to default.', 'success');
    } catch (err) {
      console.error('Error resetting database:', err);
      triggerToast('Error resetting database.', 'error');
    }
  };

  const clearActivities = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Supabase clearActivities error:', error.message);
      triggerToast('Error clearing activities.', 'error');
      return;
    }

    setActivities([]);
    triggerToast('Activity feed cleared.', 'info');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('apex_react_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    triggerToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} mode`, 'info');
  };

  return (
    <CrmContext.Provider value={{
      leads, contacts, tasks, activities, theme, toast,
      addLead, updateLead, deleteLead,
      addTask, updateTask, deleteTask,
      resetDatabase, clearActivities, toggleTheme, triggerToast, logActivity
    }}>
      {children}
    </CrmContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) throw new Error('useCrm must be used inside a CrmProvider');
  return context;
};
