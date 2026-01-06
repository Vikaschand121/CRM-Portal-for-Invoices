import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { rentReviewsService } from '../services/rentReviews.service';
import type { RentReview } from '../types';
import { formatDate } from '../utils/helpers';
import { useSnackbar } from '../hooks/useSnackbar';

const GBP_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

const formatCurrencyValue = (value?: string | number) => {
  if (value === undefined || value === null) {
    return GBP_FORMATTER.format(0);
  }
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(parsed)) {
    return 'N/A';
  }
  return GBP_FORMATTER.format(parsed);
};

const RentReviewDetailPage = () => {
  const { rentReviewId } = useParams<{ rentReviewId: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [rentReview, setRentReview] = useState<RentReview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      if (!rentReviewId) {
        return;
      }
      setLoading(true);
      try {
        const data = await rentReviewsService.getRentReview(parseInt(rentReviewId, 10));
        setRentReview(data);
      } catch (error) {
        showSnackbar('Failed to load rent review details', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [rentReviewId, showSnackbar]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={600}>
          Rent Review Details
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            {rentReview ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Rent Review Date
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatDate(rentReview.rentReviewDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Implemented
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {rentReview.implemented ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  New Rent Amount
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatCurrencyValue(rentReview.newRentAmount)}
                </Typography>
                {rentReview.notes && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">{rentReview.notes}</Typography>
                  </>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No rent review found.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default RentReviewDetailPage;
