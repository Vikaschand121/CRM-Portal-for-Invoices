import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, CircularProgress, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Meeting } from '../types';
import { propertiesService } from '../services/properties.service';
import { formatDate } from '../utils/helpers';
import { useSnackbar } from '../hooks/useSnackbar';

const MeetingDetailPage = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMeeting = async () => {
      if (!meetingId) {
        return;
      }
      setLoading(true);
      try {
        const data = await propertiesService.getMeeting(meetingId);
        setMeeting(data);
      } catch (error) {
        showSnackbar('Failed to load meeting details', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadMeeting();
  }, [meetingId, showSnackbar]);

  const formatTime = (value?: string) => {
    if (!value) return 'N/A';
    return value;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={600}>
          Meeting Details
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            {meeting ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Typography variant="body2" color="text.secondary">
                  Title
                </Typography>
                <Typography variant="body1">{meeting.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">{formatDate(meeting.date)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Start Time
                </Typography>
                <Typography variant="body1">{formatTime(meeting.startTime)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  End Time
                </Typography>
                <Typography variant="body1">{formatTime(meeting.endTime)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Company ID
                </Typography>
                <Typography variant="body1">{meeting.companyId || 'N/A'}</Typography>
                {meeting.description && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{meeting.description}</Typography>
                  </>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No meeting data available.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default MeetingDetailPage;
