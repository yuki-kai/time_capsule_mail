import React from 'react';
import { Button, Container, Box } from '@mui/material';
import { useLocation, Link } from 'react-router-dom';
import GoogleAdsense from './GoogleAdsense';

const Thanks: React.FC = () => {
  const location = useLocation();
  const state = location.state as { scheduledAt?: string } | null;
  const iso = state?.scheduledAt;
  let message = 'Your message has been scheduled.';

  try {
    if (iso) {
      const d = new Date(iso);
      const fmt = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      message = `Your message will arrive on ${fmt.format(d)}.`;
    }
  } catch {}

  return (
    <section className="app-bg">
      <Container maxWidth="sm" sx={{
        paddingTop: 8,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <h2 className="page-title">Thank you!</h2>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <p>{message}</p>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <Button
            component={Link}
            to="/"
            variant="contained"
            className="submitButton"
          >
            Back to Home
          </Button>
        </Box>
        {/* 本番環境のみ広告を表示（画面下部に固定）*/}
        <Box
          sx={{
            mt: 'auto',
            textAlign: 'center',
          }}
        >
          <GoogleAdsense />
        </Box>
      </Container>
    </section>
  );
};

export default Thanks;
