import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { EventClickArg } from '@fullcalendar/core';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  Stack,
  Chip,
  Autocomplete,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CalendarEvent, Task, Meeting, Company, User } from '../../types';
import { companiesService } from '../../services/companies.service';
import { usersService } from '../../services/users.service';

interface Event extends CalendarEvent {}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Meeting with Supplier ABC',
    start: '2025-11-03T10:00:00',
    end: '2025-11-03T11:00:00',
    description: 'Discuss new order requirements and pricing',
    extendedProps: { type: 'meeting' }
  },
  {
    id: '2',
    title: 'Delivery Deadline - Order #12345',
    start: '2025-11-05T09:00:00',
    description: 'Critical delivery deadline for electronics shipment',
    extendedProps: { type: 'task' }
  },
  {
    id: '3',
    title: 'Quality Check - Batch QC001',
    start: '2025-11-07T14:00:00',
    end: '2025-11-07T15:00:00',
    description: 'Inspect incoming materials from supplier XYZ',
    extendedProps: { type: 'meeting' }
  },
  {
    id: '4',
    title: 'Vendor Onboarding Call',
    start: '2025-11-10T15:00:00',
    end: '2025-11-10T16:00:00',
    description: 'Welcome call for new vendor registration',
    extendedProps: { type: 'meeting' }
  },
  {
    id: '5',
    title: 'Monthly Review Meeting',
    start: '2025-11-12T11:00:00',
    end: '2025-11-12T12:00:00',
    description: 'Review supplier performance metrics',
    extendedProps: { type: 'meeting' }
  },
  {
    id: '6',
    title: 'Contract Renewal Deadline',
    start: '2025-11-15T17:00:00',
    description: 'Renewal deadline for supplier contract #789',
    extendedProps: { type: 'task' }
  },
  {
    id: '7',
    title: 'Audit Preparation',
    start: '2025-11-18T09:00:00',
    end: '2025-11-18T12:00:00',
    description: 'Prepare documentation for quarterly audit',
    extendedProps: { type: 'meeting' }
  },
  {
    id: '8',
    title: 'Supplier Training Session',
    start: '2025-11-20T13:00:00',
    end: '2025-11-20T15:00:00',
    description: 'Training on new quality standards',
    extendedProps: { type: 'meeting' }
  },
  {
    id: '9',
    title: 'Payment Due Date',
    start: '2025-11-22T08:00:00',
    description: 'Payment due for invoice #INV-2024-001',
    extendedProps: { type: 'task' }
  },
  {
    id: '10',
    title: 'Emergency Maintenance',
    start: '2025-11-25T10:00:00',
    end: '2025-11-25T11:00:00',
    description: 'Scheduled maintenance for production line',
    extendedProps: { type: 'meeting' }
  },
  {
    id: '11',
    title: 'Supplier Visit',
    start: '2025-11-28T14:00:00',
    end: '2025-11-28T16:00:00',
    description: 'On-site visit to supplier facility',
    extendedProps: { type: 'meeting' }
  },
  {
    id: '12',
    title: 'Year-End Review',
    start: '2025-11-30T09:00:00',
    end: '2025-11-30T12:00:00',
    description: 'Annual supplier performance review',
    extendedProps: { type: 'meeting' }
  },
  // Additional events for the same day (2025-11-03)
  {
    id: '13',
    title: 'Team Standup Meeting',
    start: '2025-11-03T09:00:00',
    end: '2025-11-03T09:30:00',
    description: 'Daily team standup to discuss progress',
    extendedProps: { type: 'meeting' }
  },
  {
    id: '14',
    title: 'Client Presentation',
    start: '2025-11-03T14:00:00',
    end: '2025-11-03T15:30:00',
    description: 'Present quarterly results to client',
    extendedProps: { type: 'meeting' }
  },
  {
    id: '15',
    title: 'Review Project Documentation',
    start: '2025-11-03T11:00:00',
    description: 'Update and review project documentation',
    extendedProps: { type: 'task' }
  },
  {
    id: '16',
    title: 'Submit Monthly Report',
    start: '2025-11-03T16:00:00',
    description: 'Compile and submit monthly performance report',
    extendedProps: { type: 'task' }
  }
];

interface CalendarComponentRef {
  openCreateTaskDialog: () => void;
  openCreateMeetingDialog: () => void;
}

const CalendarComponent = forwardRef<CalendarComponentRef>((props, ref) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventsForDate, setEventsForDate] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    date: null as Date | null,
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: null as Date | null,
    startTime: null as Date | null,
    endTime: null as Date | null,
    description: '',
    companyId: '',
    userIds: [] as number[]
  });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openCreateTaskDialog: () => setCreateTaskOpen(true),
    openCreateMeetingDialog: () => setCreateMeetingOpen(true)
  }));

  // Fetch companies and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesData, usersData] = await Promise.all([
          companiesService.getCompanies(),
          usersService.getUsers()
        ]);
        setCompanies(companiesData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleDateClick = (arg: any) => {
    const clickedDate = arg.date;
    setSelectedDate(clickedDate);

    const eventsOnDate = events.filter(event => {
      const eventDate = new Date(event.start).toDateString();
      return eventDate === clickedDate.toDateString();
    });

    setEventsForDate(eventsOnDate);
    setOpen(true);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const event = events.find(e => e.id === arg.event.id);
    if (event) {
      setEventsForDate([event]);
      setSelectedDate(new Date(event.start));
      setOpen(true);
    }
  };

  const handleDayCellDidMount = (arg: any) => {
    const dateStr = arg.date.toISOString().split('T')[0];
    const dayEvents = filteredEvents.filter(event => event.start.startsWith(dateStr));
    const hasMeetings = dayEvents.some(event => event.extendedProps?.type === 'meeting');
    const hasTasks = dayEvents.some(event => event.extendedProps?.type === 'task');

    if (hasMeetings && hasTasks) {
      arg.el.style.backgroundColor = '#f3e5f5'; // Light purple for days with both
    } else if (hasMeetings) {
      arg.el.style.backgroundColor = '#e3f2fd'; // Light blue for days with meetings
    } else if (hasTasks) {
      arg.el.style.backgroundColor = '#ffebee'; // Light red for days with tasks
    }
  };

  const handleFilterEvents = () => {
    if (!filterStartDate || !filterEndDate) return;

    const startDate = new Date(filterStartDate);
    const endDate = new Date(filterEndDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const filtered = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate >= startDate && eventDate <= endDate;
    });

    setFilteredEvents(filtered);
  };

  const handleClearFilter = () => {
    setFilteredEvents(events);
    setFilterStartDate(null);
    setFilterEndDate(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    if (event.extendedProps?.type === 'task') {
      setTaskForm({
        title: event.title,
        date: new Date(event.start),
        description: event.description || '',
        priority: event.extendedProps?.priority || 'medium'
      });
      setCreateTaskOpen(true);
    } else if (event.extendedProps?.type === 'meeting') {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end || event.start);
      setMeetingForm({
        title: event.title,
        date: startDate,
        startTime: startDate,
        endTime: endDate,
        description: event.description || '',
        companyId: event.extendedProps?.companyId?.toString() || '',
        userIds: event.extendedProps?.userIds || []
      });
      setCreateMeetingOpen(true);
    }
    setOpen(false);
  };

  const handleDeleteEvent = (event: Event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      setEvents(prev => prev.filter(e => e.id !== event.id));
      setOpen(false);
    }
  };

  const handleCreateTask = () => {
    if (!taskForm.title || !taskForm.date) return;

    const newTask: Event = {
      id: editingEvent ? editingEvent.id : Date.now().toString(),
      title: taskForm.title,
      start: taskForm.date.toISOString().split('T')[0] + 'T00:00:00',
      description: taskForm.description,
      extendedProps: {
        type: 'task',
        priority: taskForm.priority
      }
    };

    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? newTask : e));
    } else {
      setEvents(prev => [...prev, newTask]);
    }

    setCreateTaskOpen(false);
    setEditingEvent(null);
    setTaskForm({
      title: '',
      date: null,
      description: '',
      priority: 'medium'
    });
  };

  const handleCreateMeeting = () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.startTime || !meetingForm.endTime) return;

    const startDateTime = new Date(meetingForm.date);
    const startTime = new Date(meetingForm.startTime);
    const endTime = new Date(meetingForm.endTime);

    startDateTime.setHours(startTime.getHours(), startTime.getMinutes());
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes());

    const newMeeting: Event = {
      id: editingEvent ? editingEvent.id : Date.now().toString(),
      title: meetingForm.title,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      description: meetingForm.description,
      extendedProps: {
        type: 'meeting',
        companyId: meetingForm.companyId ? parseInt(meetingForm.companyId) : undefined,
        userIds: meetingForm.userIds,
        attendees: users.filter(u => meetingForm.userIds.includes(u.id)).map(u => u.name || `${u.first_name} ${u.last_name}`)
      }
    };

    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? newMeeting : e));
    } else {
      setEvents(prev => [...prev, newMeeting]);
    }

    setCreateMeetingOpen(false);
    setEditingEvent(null);
    setMeetingForm({
      title: '',
      date: null,
      startTime: null,
      endTime: null,
      description: '',
      companyId: '',
      userIds: []
    });
  };

  return (
    <Box sx={{ height: '100vh', p: 2 }}>
      {/* Date Range Filter */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={filterStartDate}
            onChange={(date) => setFilterStartDate(date)}
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="End Date"
            value={filterEndDate}
            onChange={(date) => setFilterEndDate(date)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </LocalizationProvider>
        <Button variant="contained" onClick={handleFilterEvents} size="small">
          Filter
        </Button>
        <Button variant="outlined" onClick={handleClearFilter} size="small">
          Clear Filter
        </Button>
      </Box>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={filteredEvents.map(event => ({
          ...event,
          backgroundColor: event.extendedProps?.type === 'meeting' ? '#1976d2' : '#dc004e',
          borderColor: event.extendedProps?.type === 'meeting' ? '#1976d2' : '#dc004e',
          textColor: '#ffffff'
        }))}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        dayCellDidMount={handleDayCellDidMount}
        height="100%"
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Events for {selectedDate?.toDateString()}
        </DialogTitle>
        <DialogContent>
          {eventsForDate.length > 0 ? (
            <List>
              {eventsForDate.map(event => (
                <ListItem key={event.id} secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleEditEvent(event)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteEvent(event)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                }>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1">{event.title}</Typography>
                        <Chip
                          label={event.extendedProps?.type || 'event'}
                          size="small"
                          color={event.extendedProps?.type === 'meeting' ? 'primary' : 'secondary'}
                        />
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {event.start} {event.end && ` - ${event.end}`}
                        </Typography>
                        {event.description && (
                          <Typography variant="body2" color="text.secondary">
                            {event.description}
                          </Typography>
                        )}
                        {event.extendedProps?.attendees && event.extendedProps.attendees.length > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Attendees: {event.extendedProps.attendees.join(', ')}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No events for this date.</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onClose={() => setCreateTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Task</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                value={taskForm.title}
                onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
              />
              <DatePicker
                label="Date"
                value={taskForm.date}
                onChange={(date) => setTaskForm(prev => ({ ...prev, date }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create Meeting Dialog */}
      <Dialog open={createMeetingOpen} onClose={() => setCreateMeetingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Meeting</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                value={meetingForm.title}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
              />
              <DatePicker
                label="Date"
                value={meetingForm.date}
                onChange={(date) => setMeetingForm(prev => ({ ...prev, date }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TimePicker
                label="Start Time"
                value={meetingForm.startTime}
                onChange={(time) => setMeetingForm(prev => ({ ...prev, startTime: time }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TimePicker
                label="End Time"
                value={meetingForm.endTime}
                onChange={(time) => setMeetingForm(prev => ({ ...prev, endTime: time }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <FormControl fullWidth>
                <InputLabel>Company</InputLabel>
                <Select
                  value={meetingForm.companyId}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, companyId: e.target.value }))}
                >
                  {companies.map(company => (
                    <MenuItem key={company.id} value={company.id?.toString()}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(user) => user.name || `${user.first_name} ${user.last_name}`}
                value={users.filter(user => meetingForm.userIds.includes(user.id))}
                onChange={(_, newValue) => setMeetingForm(prev => ({
                  ...prev,
                  userIds: newValue.map(user => user.id)
                }))}
                renderInput={(params) => (
                  <TextField {...params} label="Attendees" placeholder="Select attendees" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((user, index) => (
                    <Chip
                      label={user.name || `${user.first_name} ${user.last_name}`}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={meetingForm.description}
                onChange={(e) => setMeetingForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateMeetingOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateMeeting} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

CalendarComponent.displayName = 'CalendarComponent';

export default CalendarComponent;