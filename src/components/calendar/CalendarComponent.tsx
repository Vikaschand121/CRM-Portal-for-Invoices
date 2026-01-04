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
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  Stack,
  Chip,
  Autocomplete,
  IconButton,
  Switch
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CalendarEvent, Task, Meeting, Company, User, CreateMeetingPayload } from '../../types';

const formatUserLabel = (user?: User) => {
  if (!user) return 'User';
  if (user.name?.trim()) return user.name;
  const first = user.first_name?.trim() ?? '';
  const last = user.last_name?.trim() ?? '';
  const combined = `${first} ${last}`.trim();
  return combined || 'User';
};
import { companiesService } from '../../services/companies.service';
import { usersService } from '../../services/users.service';
import { propertiesService } from '../../services/properties.service';

interface Event extends CalendarEvent {}


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
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [creatingMeeting, setCreatingMeeting] = useState(false);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    date: null as Date | null,
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    assignees: [] as string[],
    sendEmail: false
  });

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: null as Date | null,
    startTime: null as Date | null,
    endTime: null as Date | null,
    description: '',
    companyId: '',
    userIds: [] as number[],
    sendEmail: false
  });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    openCreateTaskDialog: () => setCreateTaskOpen(true),
    openCreateMeetingDialog: () => setCreateMeetingOpen(true)
  }));

  // Fetch companies, users, and events on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesData, usersData, eventsData] = await Promise.all([
          companiesService.getCompanies(),
          usersService.getUsers(),
          propertiesService.getEvents()
        ]);
        setCompanies(companiesData);
        setUsers(usersData);

        // Map events data to match CalendarEvent interface
        const mappedEvents: Event[] = eventsData.map(event => {
          const rawAssignees: string[] = (event as any).assignees || (event as any).attendees || [];
          const userIdsFromPayload = rawAssignees
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id));
          const attendeesDisplay = userIdsFromPayload
            .map((id) => formatUserLabel(usersData.find((user) => user.id === id)))
            .filter(Boolean) as string[];
          const priority = event.extendedProps?.priority
            ? (event.extendedProps.priority as string).toLowerCase() as 'low' | 'medium' | 'high'
            : undefined;

          return {
            ...event,
            extendedProps: {
              type: event.extendedProps?.type ?? 'task',
              priority,
              companyId: (event as any).companyId ? parseInt((event as any).companyId) : undefined,
              userIds: userIdsFromPayload,
              attendees: attendeesDisplay,
              sendEmail: event.extendedProps?.sendEmail ?? false
            }
          };
        });

        setEvents(mappedEvents);
        setFilteredEvents(mappedEvents);
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
    }).sort((a, b) => {
      // Sort by type first: tasks before meetings
      if (a.extendedProps?.type === 'task' && b.extendedProps?.type === 'meeting') return -1;
      if (a.extendedProps?.type === 'meeting' && b.extendedProps?.type === 'task') return 1;
      // Then by start time
      return new Date(a.start).getTime() - new Date(b.start).getTime();
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
        priority:
          ((event.extendedProps?.priority as string)?.charAt(0).toUpperCase() +
            (event.extendedProps?.priority as string)?.slice(1) ||
            'Medium') as 'Low' | 'Medium' | 'High',
        assignees: event.extendedProps?.userIds?.map((id) => id.toString()) || [],
        sendEmail: event.extendedProps?.sendEmail ?? false
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
        userIds: event.extendedProps?.userIds || [],
        sendEmail: event.extendedProps?.sendEmail ?? false
      });
      setCreateMeetingOpen(true);
    }
    setOpen(false);
  };

  const handleDeleteEvent = async (event: Event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        if (event.extendedProps?.type === 'task') {
          await propertiesService.deleteTask(event.id);
        } else if (event.extendedProps?.type === 'meeting') {
          await propertiesService.deleteMeeting(event.id);
        }
        setEvents(prev => prev.filter(e => e.id !== event.id));
        setOpen(false);
      } catch (error) {
        console.error('Error deleting event:', error);
        // Handle error
      }
    }
  };

  const handleTaskSendEmailToggle = (checked: boolean) => {
    if (checked && !window.confirm('Are you sure you want to send email?')) {
      return;
    }
    setTaskForm(prev => ({ ...prev, sendEmail: checked }));
  };

  const handleMeetingSendEmailToggle = (checked: boolean) => {
    if (checked && !window.confirm('Are you sure you want to send email?')) {
      return;
    }
    setMeetingForm(prev => ({ ...prev, sendEmail: checked }));
  };

  const handleCreateTask = async () => {
    if (!taskForm.title || !taskForm.date) return;

    setCreatingTask(true);
    try {
      const payload = {
        title: taskForm.title,
        date: taskForm.date.toISOString(),
        priority: taskForm.priority,
        description: taskForm.description,
        isArchived: false,
        assignees: taskForm.assignees,
        sendEmail: taskForm.sendEmail
      };

      let updatedTask: Task;
      if (editingEvent && editingEvent.extendedProps?.type === 'task') {
        updatedTask = await propertiesService.updateTask(editingEvent.id, payload);
      } else {
        updatedTask = await propertiesService.createTask(payload);
      }

      const assigneeIds = taskForm.assignees
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id));
      const attendeeNames = users
        .filter((user) => taskForm.assignees.includes(user.id.toString()))
        .map((user) => formatUserLabel(user));

      const newEvent: Event = {
        id: updatedTask.id,
        title: updatedTask.title,
        start: updatedTask.date,
        description: updatedTask.description,
        extendedProps: {
          type: 'task',
          priority: updatedTask.priority?.toLowerCase() as 'low' | 'medium' | 'high',
          userIds: assigneeIds,
          attendees: attendeeNames,
          sendEmail: taskForm.sendEmail
        }
      };

      if (editingEvent) {
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? newEvent : e));
      } else {
        setEvents(prev => [...prev, newEvent]);
      }

      setCreateTaskOpen(false);
      setEditingEvent(null);
      setTaskForm({
        title: '',
        date: null,
        description: '',
        priority: 'Medium',
        assignees: [],
        sendEmail: false
      });
    } catch (error) {
      console.error('Error saving task:', error);
      // Handle error, maybe show snackbar
    } finally {
      setCreatingTask(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.startTime || !meetingForm.endTime) return;

    setCreatingMeeting(true);
    try {
      const dateStr = meetingForm.date.toISOString().split('T')[0];
      const startTimeStr = meetingForm.startTime.toTimeString().split(' ')[0];
      const endTimeStr = meetingForm.endTime.toTimeString().split(' ')[0];

      const payload: CreateMeetingPayload = {
        title: meetingForm.title,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        companyId: meetingForm.companyId,
        attendees: meetingForm.userIds.map(id => id.toString()),
        description: meetingForm.description,
        isArchived: false,
        sendEmail: meetingForm.sendEmail
      };

      let updatedMeeting: any;
      if (editingEvent && editingEvent.extendedProps?.type === 'meeting') {
        updatedMeeting = await propertiesService.updateMeeting(editingEvent.id, payload);
      } else {
        updatedMeeting = await propertiesService.createMeeting(payload);
      }

      const startDateTime = new Date(meetingForm.date);
      const startTime = new Date(meetingForm.startTime);
      const endTime = new Date(meetingForm.endTime);

      startDateTime.setHours(startTime.getHours(), startTime.getMinutes());
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes());

      const newMeeting: Event = {
        id: updatedMeeting.id || editingEvent?.id || Date.now().toString(),
        title: meetingForm.title,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        description: meetingForm.description,
        extendedProps: {
          type: 'meeting',
          companyId: meetingForm.companyId ? parseInt(meetingForm.companyId) : undefined,
          userIds: meetingForm.userIds,
          attendees: users.filter(u => meetingForm.userIds.includes(u.id)).map(u => u.name || `${u.first_name} ${u.last_name}`),
          sendEmail: meetingForm.sendEmail
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
        userIds: [],
        sendEmail: false
      });
    } catch (error) {
      console.error('Error saving meeting:', error);
      // Handle error
    } finally {
      setCreatingMeeting(false);
    }
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
                  onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as 'Low' | 'Medium' | 'High' }))}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(user) => formatUserLabel(user)}
                value={users.filter((user) => taskForm.assignees.includes(user.id.toString()))}
                onChange={(_, newValue) => setTaskForm(prev => ({
                  ...prev,
                  assignees: newValue.map((user) => user.id.toString())
                }))}
                renderInput={(params) => (
                  <TextField {...params} label="Assignees" placeholder="Select users" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((user, index) => (
                    <Chip
                      label={formatUserLabel(user)}
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
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={taskForm.sendEmail}
                    onChange={(_, checked) => handleTaskSendEmailToggle(checked)}
                    color="primary"
                  />
                }
                label="Are you sure you want to send email?"
                sx={{ mt: 1 }}
              />
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained" disabled={creatingTask}>
            {creatingTask ? 'Creating...' : 'Create'}
          </Button>
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
              <FormControlLabel
                control={
                  <Switch
                    checked={meetingForm.sendEmail}
                    onChange={(_, checked) => handleMeetingSendEmailToggle(checked)}
                    color="primary"
                  />
                }
                label="Are you sure you want to send email?"
                sx={{ mt: 1 }}
              />
            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateMeetingOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateMeeting} variant="contained" disabled={creatingMeeting}>
            {creatingMeeting ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

CalendarComponent.displayName = 'CalendarComponent';

export default CalendarComponent;
