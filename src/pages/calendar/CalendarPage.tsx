import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import CalendarComponent from '../../components/calendar/CalendarComponent';

interface CalendarComponentRef {
  openCreateTaskDialog: () => void;
  openCreateMeetingDialog: () => void;
}

const CalendarPage: React.FC = () => {
  const calendarRef = React.useRef<CalendarComponentRef>(null);

  const handleCreateTask = () => {
    if (calendarRef.current) {
      calendarRef.current.openCreateTaskDialog();
    }
  };

  const handleCreateMeeting = () => {
    if (calendarRef.current) {
      calendarRef.current.openCreateMeetingDialog();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Calendar
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCreateTask}>
          Create Task
        </Button>
        <Button variant="contained" color="secondary" onClick={handleCreateMeeting}>
          Create Meeting
        </Button>
      </Stack>
      <CalendarComponent ref={calendarRef} />
    </Box>
  );
};

export default CalendarPage;