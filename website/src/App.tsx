import { useState } from 'react';
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

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
  { label: '1年後', value: getDateAfterYear(1) },
  { label: '5年後', value: getDateAfterYear(5) },
  { label: '10年後', value: getDateAfterYear(10) },
];

function App() {
  const [values, setValues] = useState<Values>({
    title: "",
    body: "",
    email: "",
    scheduledAt: dateOptions[0].value,
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
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // メールアドレスが有効かどうかを判定する変数
  const isEmailValid = values.email === '' || regexpEmail.test(values.email);

  // フォームが送信可能かどうかを判定する変数
  const isSubmittable = values.title !== '' && values.body !== '' && regexpEmail.test(values.email);

  return (
    <section>
      <Container maxWidth="sm">
        <h2>タイムカプセルメール</h2>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            name="title"
            id="title"
            label="タイトル"
            variant="filled"
            margin="dense"
            fullWidth
            value={values.title}
            onChange={handleChange}
          />
          <TextField
            name="body"
            id="body"
            label="メッセージ"
            multiline
            minRows={12}
            variant="filled"
            margin="dense"
            fullWidth
            value={values.body}
            onChange={handleChange}
          />
          <FormControl fullWidth variant="filled" margin="dense">
            <InputLabel id="scheduledAt-label">送信日時</InputLabel>
            <Select
              labelId="scheduledAt-label"
              id="scheduledAt"
              name="scheduledAt"
              value={values.scheduledAt}
              onChange={handleDateChange}
              label="送信日時"
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
            label="メールアドレス"
            variant="filled"
            margin="dense"
            fullWidth
            value={values.email}
            onChange={handleChange}
            error={!isEmailValid}
            helperText={!isEmailValid ? "Incorrect Email address format." : null}
          />
          <br />
          <br />
          <Button
            variant="contained"
            size="large"
            endIcon={<SendIcon />}
            disabled={!isSubmittable}
            onClick={handleSubmit}
          >
            メール送信予約
          </Button>
        </Box>
      </Container>
    </section>
  );
}

export default App;
