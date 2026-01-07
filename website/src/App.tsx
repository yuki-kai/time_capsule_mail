import { useState } from 'react';
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { canSendEmail, recordEmailSent, getMaxEmailsPerDay } from './utils/rateLimiter';
import AlertDialog from './components/AlertDialog';

type Values = {
  title: string;
  body: string;
  email: string;
  scheduledAt: string;
}

const regexpEmail = /^[a-zA-Z0-9_+-]+(.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

const getDateAfterYear = (yearsLater: number) => {
  const now = new Date();
  now.setFullYear(now.getFullYear() + yearsLater);
  return now.toISOString();
};

const dateOptions = [
  { label: 'Now', value: new Date().toISOString() },
  { label: '1 year later', value: getDateAfterYear(1) },
  { label: '5 years later', value: getDateAfterYear(5) },
  { label: '10 years later', value: getDateAfterYear(10) },
];

const initialValues: Values = {
  title: "",
  body: "",
  email: "",
  scheduledAt: dateOptions[0].value,
};

function App() {
  const navigate = useNavigate();
  const [values, setValues] = useState<Values>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: '',
    message: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const name = target.name;
    setValues({ ...values, [name]: target.value });
  };

  const handleDateChange = (event: SelectChangeEvent<string>) => {
    setValues({ ...values, scheduledAt: event.target.value });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // 二重送信防止
    
    // Check rate limit before proceeding
    if (!canSendEmail()) {
      setAlertDialog({
        open: true,
        title: 'Daily Limit Reached',
        message: `You have reached the daily limit of ${getMaxEmailsPerDay()} emails. Please try again tomorrow (JST).`,
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const apiEndpoint = (window as any).AppConfig.API_ENDPOINT;
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          body: values.body,
          email: values.email,
          scheduledAt: values.scheduledAt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      
      // Record successful email send for rate limiting
      recordEmailSent();
      
      navigate('/thanks', { state: { scheduledAt: values.scheduledAt } });
    } catch (error) {
      console.error('Error:', error);
      setAlertDialog({
        open: true,
        title: 'Error',
        message: 'An error occurred while submitting the form. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // メールアドレスが有効かどうかを判定する変数
  const isEmailValid = values.email === '' || regexpEmail.test(values.email);

  // フォームが送信可能かどうかを判定する変数
  const isSubmittable = values.title !== '' && values.body !== '' && regexpEmail.test(values.email);

  return (
    <section className="app-bg">
      <Container maxWidth="sm" sx={{ mb: 12 }}>
        <h2 className="page-title">Time Capsule Mail</h2>
        <p>
          What would you say to your future self?
        </p>
        <p>
          Joys, worries, and promises—capture them all before the feelings of today begin to fade.
          This service delivers your message to the future of your choice.
        </p>
        <p>
          It is a special gift from your past self, arriving exactly when you need it most.
        </p>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            name="title"
            id="title"
            label="title"
            variant="filled"
            margin="dense"
            fullWidth
            value={values.title}
            onChange={handleChange}
            sx={{
              backgroundColor: "#FFFFE0",
              opacity: 0.7,
            }}
          />
          <TextField
            name="body"
            id="body"
            label="message"
            multiline
            minRows={12}
            variant="filled"
            margin="dense"
            fullWidth
            value={values.body}
            onChange={handleChange}
            sx={{
              backgroundColor: "#FFFFE0",
              opacity: 0.7,
            }}
          />
          <FormControl fullWidth variant="filled" margin="dense">
            <InputLabel id="scheduledAt-label">scheduled date and time</InputLabel>
            <Select
              labelId="scheduledAt-label"
              id="scheduledAt"
              name="scheduledAt"
              value={values.scheduledAt}
              onChange={handleDateChange}
              label="scheduled date and time"
              sx={{
                backgroundColor: "#FFFFE0",
                opacity: 0.7,
                '&:hover': {
                  backgroundColor: "#E8E8E8",
                },
                '&.Mui-focused': {
                  backgroundColor: "#E8E8E8",
                },
                '& .MuiSelect-select': {
                  backgroundColor: 'transparent',
                },
                '& .MuiSelect-select:focus': {
                  backgroundColor: 'transparent',
                },
                '& .MuiFilledInput-input': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              {dateOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="email"
            id="email"
            label="email"
            variant="filled"
            margin="dense"
            fullWidth
            value={values.email}
            onChange={handleChange}
            error={!isEmailValid}
            helperText={!isEmailValid ? "Incorrect Email address format." : null}
            sx={{
              backgroundColor: "#FFFFE0",
              opacity: 0.7,
            }}
          />
          <br />
          <br />
          <Button
            variant="contained"
            size="large"
            endIcon={<SendIcon />}
            disabled={!isSubmittable || isSubmitting}
            onClick={handleSubmit}
            className="submitButton"
          >
            Send The Time Capsule Mail
          </Button>
        </Box>
        <AlertDialog
          open={alertDialog.open}
          title={alertDialog.title}
          message={alertDialog.message}
          onClose={() => setAlertDialog({ ...alertDialog, open: false })}
        />
      </Container>
    </section>
  );
}

export default App;
